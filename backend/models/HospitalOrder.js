const mongoose = require("mongoose");

const HospitalOrderSchema = new mongoose.Schema({
    hospitalName: { type: String, required: true },
    hospitalId: { type: String, required: true }, // Unique identifier for hospital
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
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("HospitalOrder", HospitalOrderSchema);
