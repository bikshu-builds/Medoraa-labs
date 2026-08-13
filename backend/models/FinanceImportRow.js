const mongoose = require("mongoose");

const financeImportRowSchema = new mongoose.Schema(
  {
    importBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImportBatch",
      required: true,
    },
    rowNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
    },
    category: {
      type: String,
    },
    amount: {
      type: Number,
    },
    paymentMethod: {
      type: String,
    },
    referenceNumber: {
      type: String,
    },
    description: {
      type: String,
    },
    notes: {
      type: String,
    },
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

module.exports = mongoose.model("FinanceImportRow", financeImportRowSchema);
