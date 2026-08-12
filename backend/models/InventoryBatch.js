const mongoose = require("mongoose");

const InventoryBatchSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryProduct",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    batchNumber: { type: String, required: true },
    lotNumber: { type: String },

    quantity: { type: Number, required: true },
    availableQuantity: { type: Number, required: true },

    unitCost: { type: Number, required: true },

    purchaseDate: { type: Date },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },

    invoiceNumber: { type: String },
    notes: { type: String },

    status: {
      type: String,
      enum: [
        "IN STOCK",
        "LOW STOCK",
        "OUT OF STOCK",
        "EXPIRING SOON",
        "EXPIRED",
      ],
      default: "IN STOCK",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryBatch", InventoryBatchSchema);
