const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    reportId: { type: String, required: true, unique: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    results: [
        {
            parameter: String,
            value: String,
            unit: String,
            referenceRange: String,
            status: { type: String, enum: ["Normal", "High", "Low", "Critical"] }
        }
    ],
    status: { 
        type: String, 
        enum: ["Pending", "Ready", "Delivered"], 
        default: "Pending" 
    },
    pdfUrl: { type: String },
    generatedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
}, { timestamps: true });

module.exports = mongoose.model("Report", ReportSchema);
