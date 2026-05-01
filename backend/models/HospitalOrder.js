const mongoose = require("mongoose");

const HospitalOrderSchema = new mongoose.Schema({
    hospitalName: { type: String, required: true },
    hospitalId: { type: String, required: true }, // ID of the hospital master
    patientName: { type: String, required: true },
    patientAge: { type: Number },
    patientGender: { type: String },
    doctorName: { type: String },
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
    orderDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ["Pending", "Sample Collected", "Processing", "Report Ready", "Dispatched"], 
        default: "Pending" 
    },
    priority: { type: String, enum: ["Normal", "Urgent", "Stat"], default: "Normal" },
    notes: { type: String },
    patientPhone: { type: String },
    collectionType: { type: String },
    attachment: { type: String },
    insurance: { type: String },
    corporateTag: { type: String },
    ipOpType: { type: String },
    bedNumber: { type: String },
    ward: { type: String },
    bookingId: { type: String },
    sampleReceivedAt: { type: Date },
    sampleReceivedBy: { type: String },
    labLocation: { type: String },
    inTestingAt: { type: Date },
    labTechnician: { type: String },
    workstation: { type: String },
    testResults: [{
        parameterName: String,
        value: String,
        unit: String,
        referenceRange: String,
        criticalFlag: String,
        observations: String
    }],
    microscopeImages: [{ type: String }],
    diagnosticAttachments: [{ type: String }],
    approvedBy: { type: String },
    approvedAt: { type: Date },
    approvalStatus: { type: String, enum: ["Technician Reviewed", "Pathologist Reviewed", "Final Approval", "Rejected", "Hold"], default: "Technician Reviewed" },
    approvalComments: { type: String },
    pdfUrl: { type: String },
    reportVersion: { type: Number, default: 1 },
    versionHistory: [{
        pdfUrl: String,
        updatedAt: Date,
        updatedBy: String
    }],
    invoiceStatus: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
    invoiceAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("HospitalOrder", HospitalOrderSchema);
