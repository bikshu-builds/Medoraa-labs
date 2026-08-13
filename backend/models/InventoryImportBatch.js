const mongoose = require("mongoose");

const inventoryImportBatchSchema = new mongoose.Schema(
  {
    importBatchId: {
      type: String,
      required: true,
      unique: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    totalRows: {
      type: Number,
      required: true,
      default: 0,
    },
    successfulRows: {
      type: Number,
      required: true,
      default: 0,
    },
    failedRows: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["DRAFT", "CONFIRMED", "CANCELLED"],
      required: true,
      default: "DRAFT",
    },
    sourceHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "InventoryImportBatch",
  inventoryImportBatchSchema,
);
