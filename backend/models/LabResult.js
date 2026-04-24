const mongoose = require("mongoose");

const LabResultSchema = new mongoose.Schema({
    sample: { type: mongoose.Schema.Types.ObjectId, ref: "Sample", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    parameters: [{
        name: { type: String, required: true },
        value: { type: String, required: true },
        unit: { type: String },
        referenceRange: { type: String },
        isAbnormal: { type: Boolean, default: false }
    }],
    examiner: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    microscopeImages: [{ type: String }],
    attachments: [{ type: String }],
    observations: { type: String },
    status: { type: String, enum: ["Draft", "Submitted", "Approved", "Retest"], default: "Draft" },
    approval: { type: mongoose.Schema.Types.ObjectId, ref: "Approval" }
}, { timestamps: true });

module.exports = mongoose.model("LabResult", LabResultSchema);
