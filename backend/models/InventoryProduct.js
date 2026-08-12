const mongoose = require("mongoose");

const InventoryProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    itemType: { type: String, required: true },
    unit: { type: String, required: true },
    description: { type: String },

    minimumStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryProduct", InventoryProductSchema);
