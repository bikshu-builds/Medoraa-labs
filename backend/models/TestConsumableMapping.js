const mongoose = require("mongoose");

const testConsumableMappingSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sample",
      required: true,
    },
    inventoryProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryProduct",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

// Prevent duplicate active mappings for the same test and product combination
testConsumableMappingSchema.index(
  { testId: 1, inventoryProductId: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "TestConsumableMapping",
  testConsumableMappingSchema,
);
