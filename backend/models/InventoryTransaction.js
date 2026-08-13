const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryProduct",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryBatch",
    },
    type: {
      type: String,
      enum: [
        "MANUAL_ADDITION",
        "MANUAL_DEDUCTION",
        "AUTO_DEDUCTION",
        "AUTO_DEDUCTION_REVERSAL",
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },

    // References for AUTO_DEDUCTION
    patientRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatientRegistration",
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sample",
    },

    // Auditing
    reason: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    systemGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema,
);
