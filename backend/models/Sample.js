const mongoose = require("mongoose");

const sampleSchema = new mongoose.Schema(
  {
    slno: {
      type: String,
      default: "-",
      trim: true,
    },
    organ: {
      type: String,
      default: "-",
      trim: true,
    },
    category: {
      type: String,
      default: "-",
      trim: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      default: "-",
      trim: true,
    },
    container: {
      type: String,
      default: "-",
      trim: true,
    },
    sampleUsedForTest: {
      type: String,
      default: "-",
      trim: true,
    },
    reportTime: {
      type: String,
      default: "-",
      trim: true,
    },
    referenceRange: {
      type: String,
      default: "-",
      trim: true,
    },
    labPrice: {
      type: String,
      default: "-",
      trim: true,
    },
    patientPrice: {
      type: String,
      default: "-",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sample", sampleSchema);
