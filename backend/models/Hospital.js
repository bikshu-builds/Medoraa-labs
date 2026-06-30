const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: String,
      trim: true,
    },

    pocName: {
      type: String,
      trim: true,
    },

    telephoneNumber: {
      type: String,
      trim: true,
    },

    address: {
      state: {
        type: String,
        required: true,
        trim: true,
      },

      district: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },

      village: {
        type: String,
        trim: true,
      },

      doorNo: {
        type: String,
        trim: true,
      },

      completeAddress: {
        type: String,
        trim: true,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    labs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lab"
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
