const FinanceTransaction = require("../models/FinanceTransaction");
const PatientRegistration = require("../models/PatientRegistration");
const DoctorPayment = require("../models/DoctorPayment");
const InventoryBatch = require("../models/InventoryBatch");

/**
 * Helper to build date match objects for queries
 * Uses startOfDay / endOfDay logic to safely envelop dates
 */
const getDateMatch = (startDate, endDate) => {
  const match = {};
  if (startDate || endDate) {
    match.$gte = startDate ? new Date(startDate) : new Date(0);
    match.$lte = endDate ? new Date(endDate) : new Date();
  }
  return match;
};

// @desc    Get aggregated financial summary
// @route   GET /api/admin/finance/summary
exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Setup date filters
    let transactionDateFilter = {};
    let registrationDateFilter = {};
    let doctorPaymentDateFilter = {};
    let inventoryDateFilter = {};

    if (startDate || endDate) {
      transactionDateFilter.date = getDateMatch(startDate, endDate);
      registrationDateFilter.createdAt = getDateMatch(startDate, endDate);
      doctorPaymentDateFilter.paymentCompletedDate = getDateMatch(
        startDate,
        endDate,
      );
      inventoryDateFilter.createdAt = getDateMatch(startDate, endDate);
    } // If no dates provided, gets all time (or we can enforce a default current month filter on frontend)

    // 1. Fetch Manual Transactions summary
    const manualTransactions = await FinanceTransaction.find(
      transactionDateFilter,
    );
    let manualIncome = 0;
    let manualExpense = 0;
    manualTransactions.forEach((t) => {
      if (t.type === "INCOME") manualIncome += t.amount;
      if (t.type === "EXPENSE") manualExpense += t.amount;
    });

    // 2. Fetch Patient Registration (Billing) summary
    // Income = paidAmount, Pending = totalAmount - paidAmount mapping where paymentStatus is not PAID
    const patients = await PatientRegistration.find(
      registrationDateFilter,
    ).select("totalAmount paidAmount paymentStatus");
    let patientIncome = 0;
    let pendingIncome = 0;
    patients.forEach((p) => {
      patientIncome += p.paidAmount || 0;
      if (p.paymentStatus !== "PAID") {
        const due = (p.totalAmount || 0) - (p.paidAmount || 0);
        if (due > 0) pendingIncome += due;
      }
    });

    // 3. Fetch Doctor Payment summary
    const doctorPayments = await DoctorPayment.find({
      ...doctorPaymentDateFilter,
      paymentStatus: { $in: ["PAID", "PARTIALLY_PAID"] },
    }).select("paidAmount");
    let doctorExpense = 0;
    doctorPayments.forEach((d) => {
      doctorExpense += d.paidAmount || 0;
    });

    // 4. Fetch Inventory Purchases summary
    const inventoryBatches =
      await InventoryBatch.find(inventoryDateFilter).select(
        "quantity unitCost",
      );
    let inventoryExpense = 0;
    inventoryBatches.forEach((b) => {
      const qty = b.quantity || 0;
      const cost = b.unitCost || 0;
      inventoryExpense += qty * cost;
    });

    // Final calculations
    const revenue = manualIncome + patientIncome;
    const expenses = manualExpense + doctorExpense + inventoryExpense;
    const net = revenue - expenses;

    // Breakdowns for UI
    const revenueBreakdown = {
      "Patient Billing": patientIncome,
      "Other Income": manualIncome,
    };

    const expenseBreakdown = {
      "Doctor Payments": doctorExpense,
      "Inventory Supplies": inventoryExpense,
      // We could aggregate manual categories here if needed, but we keep it simple for now
    };

    // Add manual category breakdown
    const manualExpenses = manualTransactions.filter(
      (t) => t.type === "EXPENSE",
    );
    manualExpenses.forEach((t) => {
      if (!expenseBreakdown[t.category]) expenseBreakdown[t.category] = 0;
      expenseBreakdown[t.category] += t.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        revenue,
        expenses,
        net,
        pending: pendingIncome,
        revenueBreakdown,
        expenseBreakdown,
      },
    });
  } catch (error) {
    console.error("Finance Summary Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get unified list of transactions
// @route   GET /api/admin/finance/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, search } = req.query;

    let combinedTransactions = [];

    // Construct Date Filters
    let transactionDateFilter = {};
    let registrationDateFilter = {};
    let doctorPaymentDateFilter = {};
    let inventoryDateFilter = {};

    if (startDate || endDate) {
      transactionDateFilter.date = getDateMatch(startDate, endDate);
      registrationDateFilter.createdAt = getDateMatch(startDate, endDate);
      doctorPaymentDateFilter.paymentCompletedDate = getDateMatch(
        startDate,
        endDate,
      );
      inventoryDateFilter.createdAt = getDateMatch(startDate, endDate);
    }

    // 1. Manual Transactions
    let manualQuery = { ...transactionDateFilter };
    if (type) manualQuery.type = type.toUpperCase();

    const manualTx = await FinanceTransaction.find(manualQuery).sort({
      date: -1,
    });
    manualTx.forEach((t) => {
      combinedTransactions.push({
        id: t._id,
        date: t.date,
        description: t.description || t.category,
        category: t.category,
        type: t.type,
        amount: t.amount,
        paymentMethod: t.paymentMethod,
        source: "MANUAL",
        sourceId: t._id,
        referenceNumber: t.referenceNumber || "-", // Manual entries can have references
      });
    });

    // 2. Patient Registration (Billing)
    if (!type || type.toUpperCase() === "INCOME") {
      const patients = await PatientRegistration.find({
        ...registrationDateFilter,
        paidAmount: { $gt: 0 },
      }).sort({ createdAt: -1 });
      patients.forEach((p) => {
        // Basic search term filtering for unified stream since we map it here
        const description = `${p.patientName} - Registration`;
        const reference = p.registrationNumber;
        const category = "Lab Service";

        combinedTransactions.push({
          id: p._id,
          date: p.createdAt,
          description,
          category,
          type: "INCOME",
          amount: p.paidAmount,
          paymentMethod: p.paymentMethod || "Mixed",
          source: "PATIENT_BILLING",
          sourceId: p._id,
          referenceNumber: reference,
        });
      });
    }

    // 3. Doctor Payments
    if (!type || type.toUpperCase() === "EXPENSE") {
      // Population to get Doctor name
      const doctorPayments = await DoctorPayment.find({
        ...doctorPaymentDateFilter,
        paidAmount: { $gt: 0 },
        paymentStatus: { $in: ["PAID", "PARTIALLY_PAID"] },
      })
        .populate("doctorId", "name")
        .sort({ paymentCompletedDate: -1 });

      doctorPayments.forEach((d) => {
        const doctorName = d.doctorId?.name || "Unknown Doctor";
        combinedTransactions.push({
          id: d._id,
          date: d.paymentCompletedDate,
          description: `Payment to Dr. ${doctorName}`,
          category: "Doctor Payment",
          type: "EXPENSE",
          amount: d.paidAmount,
          paymentMethod: "Bank Transfer", // Defaulting, you might have it on schema
          source: "DOCTOR_PAYMENT",
          sourceId: d._id,
          referenceNumber: "-",
        });
      });

      // 4. Inventory Purchases
      const inventoryBatches = await InventoryBatch.find(inventoryDateFilter)
        .populate("productId", "name")
        .populate("supplierId", "name")
        .sort({ createdAt: -1 });
      inventoryBatches.forEach((b) => {
        const qty = b.quantity || 0;
        const cost = b.unitCost || 0;
        const totalExpense = qty * cost;
        if (totalExpense > 0) {
          combinedTransactions.push({
            id: b._id,
            date: b.createdAt,
            description: `${b.productId?.name || "Unknown Product"} - Batch ${b.batchNumber}`,
            category: "Inventory Supplies",
            type: "EXPENSE",
            amount: totalExpense,
            paymentMethod: "Bank Transfer", // Default or you can add payment info to batch models later
            source: "INVENTORY",
            sourceId: b._id,
            referenceNumber: b.supplierId?.name || "No Supplier",
          });
        }
      });
    }

    // Sort combined stream by date descending
    combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Optional client-like search filter (if search term param provided)
    if (search) {
      const lSearch = search.toLowerCase();
      combinedTransactions = combinedTransactions.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(lSearch) ||
          tx.referenceNumber?.toLowerCase().includes(lSearch) ||
          tx.category?.toLowerCase().includes(lSearch) ||
          tx.source?.toLowerCase().includes(lSearch),
      );
    }

    res.status(200).json({
      success: true,
      count: combinedTransactions.length,
      data: combinedTransactions,
    });
  } catch (error) {
    console.error("Finance Transactions Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Add a manual finance transaction
// @route   POST /api/admin/finance/transactions
exports.addTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      date,
      paymentMethod,
      referenceNumber,
      description,
      notes,
    } = req.body;

    if (!type || !category || !amount || !date || !paymentMethod) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide all required fields" });
    }

    const transaction = await FinanceTransaction.create({
      type,
      category,
      amount,
      date,
      paymentMethod,
      referenceNumber,
      description,
      notes,
      sourceType: "MANUAL",
      createdBy: req.user ? req.user.id : undefined,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error("Add Transaction Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};
