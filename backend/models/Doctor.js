const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        doctorCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true
        },
        doctorName: {
            type: String,
            required: true,
            trim: true
        },
        degree: {
            type: String,
            required: true,
            trim: true
        },
        specialization: {
            type: String,
            required: true,
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
