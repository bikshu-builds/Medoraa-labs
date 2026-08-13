const mongoose = require("mongoose");

const inventoryImportRowSchema = new mongoose.Schema(
  {
    importBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryImportBatch",
      required: true,
    },
    rowNumber: {
      type: Number,
      required: true,
    },

    // InventoryProduct Details
    name: { type: String },
    productCode: { type: String },
    category: { type: String },
    itemType: { type: String },
    unit: { type: String },
    minimumStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },

    // InventoryBatch Details
    supplierName: { type: String },
    batchNumber: { type: String },
    quantity: { type: Number },
    unitCost: { type: Number },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },

    // Validation State
    validationStatus: {
      type: String,
      enum: ["VALID", "INVALID"],
      default: "VALID",
      required: true,
    },
    validationErrors: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryImportRow", inventoryImportRowSchema);
