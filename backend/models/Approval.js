const mongoose = require("mongoose");

const ApprovalSchema = new mongoose.Schema({
    labResult: { type: mongoose.Schema.Types.ObjectId, ref: "LabResult", required: true },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    status: { type: String, enum: ["Approved", "Rejected", "Hold"], required: true },
    comments: { type: String },
    digitalSignature: { type: String }, // Path to signature image
    approvalDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Approval", ApprovalSchema);
