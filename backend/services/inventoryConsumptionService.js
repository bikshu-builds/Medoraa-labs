const mongoose = require("mongoose");
const TestConsumableMapping = require("../models/TestConsumableMapping");
const InventoryBatch = require("../models/InventoryBatch");
const InventoryTransaction = require("../models/InventoryTransaction");
const InventoryProduct = require("../models/InventoryProduct");
const PatientRegistration = require("../models/PatientRegistration");

/**
 * Service to consume inventory based on the tests assigned to a patient registration.
 *
 * @param {string} registrationId - ID of the Patient Registration.
 * @param {Array<string>} testIds - Array of Sample (Test) IDs being performed.
 * @param {string} performedBy - Admin/User ID triggering the process.
 * @returns {Object} Consumption summary or error details.
 */
exports.consumeInventoryForRegistration = async (
  registrationId,
  testIds,
  performedBy,
) => {
  // Start a MongoDB session for atomic transactions if replica set is running
  // Note: For standalone mongodb, session commands might fail, so we will use non-transactional fallback if needed
  let session = null;
  let useTransactions = false;

  try {
    session = await mongoose.startSession();
    useTransactions = true;
    session.startTransaction();
  } catch (err) {
    // If not supported (e.g. standalone server)
    useTransactions = false;
  }

  try {
    // 1. Idempotency Check
    const registration = await PatientRegistration.findById(
      registrationId,
    ).session(useTransactions ? session : null);
    if (!registration) {
      throw new Error(`Registration not found: ${registrationId}`);
    }

    if (registration.inventoryProcessed) {
      if (useTransactions) await session.abortTransaction();
      if (session) session.endSession();
      return {
        success: true,
        message:
          "Inventory already processed for this registration (idempotent skip).",
      };
    }

    // 2. Load mappings for the selected tests
    const mappings = await TestConsumableMapping.find({
      testId: { $in: testIds },
      isActive: true,
    })
      .populate("inventoryProductId")
      .populate("testId", "testName")
      .session(useTransactions ? session : null);

    if (mappings.length === 0) {
      // Nothing to consume, but mark as processed
      registration.inventoryProcessed = true;
      await registration.save({ session: useTransactions ? session : null });
      if (useTransactions) await session.commitTransaction();
      if (session) session.endSession();
      return {
        success: true,
        message: "No inventory mappings found for the selected tests.",
      };
    }

    // 3. Combine duplicate required products
    const requiredProducts = {}; // { productId: { product, totalQuantity, tests: [] } }

    mappings.forEach((mapping) => {
      if (!mapping.inventoryProductId || !mapping.testId) return;

      const prodId = mapping.inventoryProductId._id
        ? mapping.inventoryProductId._id.toString()
        : mapping.inventoryProductId.toString();
      if (!requiredProducts[prodId]) {
        requiredProducts[prodId] = {
          product: mapping.inventoryProductId,
          totalQuantity: 0,
          tests: [],
        };
      }
      requiredProducts[prodId].totalQuantity += mapping.quantity;
      const tIdStr = mapping.testId._id
        ? mapping.testId._id.toString()
        : mapping.testId.toString();
      const tName = mapping.testId.testName || "Unknown Test";

      if (!requiredProducts[prodId].tests.find((t) => t.testId === tIdStr)) {
        requiredProducts[prodId].tests.push({
          testId: mapping.testId._id || mapping.testId,
          testName: tName,
          quantity: mapping.quantity,
        });
      }
    });

    const consumptionSummary = [];

    // 4. Pre-deduction Stock Check
    for (const prodId of Object.keys(requiredProducts)) {
      const { product, totalQuantity } = requiredProducts[prodId];

      const batches = await InventoryBatch.find({
        productId: prodId,
        availableQuantity: { $gt: 0 },
        // Ensure we don't pick EXPIRED if we specifically manage statuses,
        // though FEFO implies sorting. We will exclude completely EXPIRED ones if possible
        status: { $ne: "EXPIRED" },
      })
        .sort({ expiryDate: 1, createdAt: 1 }) // FEFO
        .session(useTransactions ? session : null);

      const totalAvailable = batches.reduce(
        (sum, b) => sum + b.availableQuantity,
        0,
      );

      if (totalAvailable < totalQuantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Required: ${totalQuantity} ${product.unit}, Available: ${totalAvailable} ${product.unit}`,
        );
      }

      requiredProducts[prodId].batches = batches;
    }

    // 5. Deduct Stock via FEFO
    for (const prodId of Object.keys(requiredProducts)) {
      let { product, totalQuantity, batches, tests } = requiredProducts[prodId];
      let remainingToDeduct = totalQuantity;

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;

        const deductAmount = Math.min(
          batch.availableQuantity,
          remainingToDeduct,
        );
        const previousQuantity = batch.availableQuantity;
        batch.availableQuantity -= deductAmount;

        // Update batch status if needed
        if (batch.availableQuantity === 0) {
          batch.status = "OUT OF STOCK";
        } else if (batch.availableQuantity <= product.minimumStock) {
          batch.status = "LOW STOCK";
        }

        await batch.save({ session: useTransactions ? session : null });

        // 6. Create Transaction
        await InventoryTransaction.create(
          [
            {
              productId: product._id,
              batchId: batch._id,
              type: "AUTO_DEDUCTION",
              quantity: deductAmount,
              previousQuantity: previousQuantity,
              newQuantity: batch.availableQuantity,
              patientRegistrationId: registrationId,
              testId: tests.length === 1 ? tests[0].testId : null, // If combined, this is null at the transaction level, but can be broken down if needed.
              reason: `Patient Registration Auto-Deduction for ${tests.map((t) => t.testName).join(", ")}`,
              performedBy: performedBy,
              systemGenerated: true,
            },
          ],
          { session: useTransactions ? session : null },
        );

        remainingToDeduct -= deductAmount;
      }

      consumptionSummary.push({
        productName: product.name,
        quantityUsed: totalQuantity,
        unit: product.unit,
      });
    }

    // 7. Mark as processed
    registration.inventoryProcessed = true;
    await registration.save({ session: useTransactions ? session : null });

    if (useTransactions) {
      await session.commitTransaction();
    }
    if (session) session.endSession();

    return {
      success: true,
      message: "Inventory successfully deducted.",
      summary: consumptionSummary,
    };
  } catch (error) {
    if (useTransactions && session) {
      await session.abortTransaction();
    }
    if (session) session.endSession();
    return {
      success: false,
      error: error.message,
    };
  }
};
