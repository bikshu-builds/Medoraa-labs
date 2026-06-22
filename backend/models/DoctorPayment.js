const mongoose = require("mongoose");

const doctorPaymentSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
            index: true
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
            index: true
        },
        periodType: {
            type: String,
            enum: ["WEEKLY", "FIFTEEN_DAYS", "MONTHLY"],
            required: true
        },
        periodStartDate: {
            type: Date,
            required: true,
            index: true
        },
        periodEndDate: {
            type: Date,
            required: true,
            index: true
        },
        totalReferralAmount: {
            type: Number,
            required: true,
            default: 0
        },
        paidAmount: {
            type: Number,
            required: true,
            default: 0
        },
        dueAmount: {
            type: Number,
            required: true,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PARTIALLY_PAID", "PAID", "CANCELLED"],
            default: "PENDING",
            index: true
        },
        paymentCompletedDate: {
            type: Date
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Compound Index for doctorId + paymentStatus
doctorPaymentSchema.index({ doctorId: 1, paymentStatus: 1 });

module.exports = mongoose.model("DoctorPayment", doctorPaymentSchema);
