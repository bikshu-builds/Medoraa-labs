const mongoose = require("mongoose");

const patientRegistrationSchema = new mongoose.Schema(
  {
    // Section 1: Location Information
    location: {
      state: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
    },

    // Section 2: Patient Information
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      value: {
        type: Number,
        required: true,
        min: 1,
      },
      type: {
        type: String,
        required: true,
        enum: ["Years", "Months", "Days"],
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid 10-digit mobile number!`,
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Section 3: Referral Information
    referredBy: {
      type: String,
      required: true,
      trim: true,
    },
    sampleDrawnBy: {
      type: String, // Employee Name (Employee ID)
      trim: true,
    },

    // Section 4: Sample Received By
    sampleReceived: {
      receivedThrough: {
        type: String,
        required: true,
        enum: ["Employee", "Person", "Courier", "Bus", "None"],
      },
      // If "Employee" selected
      employee: {
        name: { type: String, trim: true },
        id: { type: String, trim: true },
        mobileNumber: { type: String, trim: true },
        department: { type: String, trim: true },
        designation: { type: String, trim: true },
        dateReceived: { type: String, trim: true },
        timeReceived: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
      // If "Person" selected
      person: {
        name: { type: String, trim: true },
        mobileNumber: { type: String, trim: true },
        relationship: { type: String, trim: true }, // Relationship / Designation
        address: { type: String, trim: true },
        idProofType: { type: String, trim: true },
        idProofNumber: { type: String, trim: true },
        dateReceived: { type: String, trim: true },
        timeReceived: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
      // If "Courier" selected
      courier: {
        companyName: { type: String, trim: true },
        trackingNumber: { type: String, trim: true },
        orderNumber: { type: String, trim: true },
        contactNumber: { type: String, trim: true },
        pickupLocation: { type: String, trim: true },
        arrivalDate: { type: String, trim: true },
        arrivalTime: { type: String, trim: true },
        receivedByEmployee: { type: String, trim: true },
        packageCondition: {
          type: String,
          enum: ["Good", "Damaged", "Opened", ""],
          default: "",
        },
        remarks: { type: String, trim: true },
      },
      // If "Bus" selected
      bus: {
        busNumber: { type: String, trim: true },
        busServiceName: { type: String, trim: true },
        driverName: { type: String, trim: true },
        driverMobileNumber: { type: String, trim: true },
        conductorName: { type: String, trim: true },
        conductorMobileNumber: { type: String, trim: true },
        originLocation: { type: String, trim: true },
        destinationLocation: { type: String, trim: true },
        arrivalDate: { type: String, trim: true },
        arrivalTime: { type: String, trim: true },
        receivedByEmployee: { type: String, trim: true },
        packageCondition: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    },

    // Section 5: Registration Details
    registrationDate: {
      type: String, // DD-MM-YYYY
      required: true,
    },
    registrationTime: {
      type: String, // HH:MM:SS AM/PM
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    tests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sample",
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PatientRegistration", patientRegistrationSchema);
