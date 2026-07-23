const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        doctorCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        affiliationType: {
            type: String,
            enum: ["HOSPITAL", "LAB"],
            default: "HOSPITAL"
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: false,
            index: true
        },
        labId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lab",
            required: false,
            index: true
        },
        labName: {
            type: String,
            trim: true
        },
        branch: {
            type: String,
            trim: true
        },
        completeAddress: {
            type: String,
            trim: true
        },
        doctorName: {
            type: String,
            required: true,
            trim: true
        },
        degree: {
            type: String,
            required: false,
            trim: true
        },
        specialization: {
            type: String,
            required: false,
            trim: true
        },
        referralPercentage: {
            type: Number,
            required: true,
            default: 0
        },
        periodType: {
            type: String,
            enum: ["WEEKLY", "FIFTEEN_DAYS", "MONTHLY"],
            default: "WEEKLY"
        },
        periodStartDate: {
            type: Date
        },
        periodEndDate: {
            type: Date
        },
        dateOfBirth: {
            type: Date
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other", "Prefer not to say"]
        },
        mobileNumber: {
            type: String,
            required: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            index: true,
            lowercase: true,
            trim: true
        },
        reportDeliveryMethod: {
            type: String,
            enum: ["MAIL", "WHATSAPP"],
            default: "MAIL"
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        },
        isActive: {
            type: Boolean,
            default: true // for soft deletion
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        }
    },
    { timestamps: true }
);

// Compound Index
doctorSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
