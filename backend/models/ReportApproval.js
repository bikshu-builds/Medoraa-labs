const mongoose = require("mongoose");

const ReportApprovalSchema = new mongoose.Schema({
    reportId: { type: String, required: true, unique: true },
    patientName: { type: String, required: true },
    testName: { type: String, required: true },
    generatedBy: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    },
    comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("ReportApproval", ReportApprovalSchema);
