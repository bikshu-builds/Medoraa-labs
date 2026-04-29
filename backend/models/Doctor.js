const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hospitalName: { type: String, required: true },
    branch: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    commissionPercentage: { type: Number, required: true, default: 0 },
    specialty: { type: String },
    registrationNumber: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    preferredCommunication: { type: String, enum: ["Email", "WhatsApp", "SMS"], default: "Email" },
    referralCategory: { type: String, enum: ["General", "Specialist", "Corporate"], default: "General" },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", DoctorSchema);
