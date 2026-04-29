const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const PatientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, sparse: true },
    password: { type: String },
    phoneNumber: { type: String, required: true }, // Removed unique: true to allow family sharing
    age: { type: Number, required: true },
    dob: { type: Date },
    gender: { 
        type: String, 
        enum: ["Male", "Female", "Other"], 
        required: true 
    },
    profileImage: { type: String },
    bloodGroup: { type: String },
    agreedToBloodGroupTest: { type: Boolean, default: false },
    reasonForTest: { type: String },
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
    existingConditions: [{ type: String }],
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    sourceType: { 
        type: String, 
        enum: [
            "Walk-in", 
            "Referring Doctor", 
            "Home Collection", 
            "Corporate / Camps",
            "Online Booking",
            "Insurance Partner",
            "Marketing Campaign",
            "Repeat Patient",
            "Hospital Tie-up",
            "Diagnostic Package Campaign"
        ], 
        required: true 
    },
    doctorReferral: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    corporateDetails: {
        corporateName: String,
        campName: String,
        campId: String,
        hrCoordinator: String,
        bulkUploadId: String,
        corporateDiscount: Number,
        billingAccount: String,
        contractValidity: Date
    },
    testStatus: { 
        type: String, 
        enum: ["Pending", "Sample Collected", "Processing", "Completed"], 
        default: "Pending" 
    },
    revenue: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    otp: {
        code: String,
        expiresAt: Date
    },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    familyMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "FamilyMember" }],
    date: { type: Date, default: Date.now }
}, { timestamps: true });

PatientSchema.pre("save", async function() {
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

PatientSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Patient", PatientSchema);
