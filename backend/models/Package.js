const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    type: { type: String, enum: ["Package", "Membership"], default: "Package" },
    durationMonths: { type: Number, default: 12 }, // Used for Memberships
    includedTests: [{ type: String }], // Array of test IDs
    features: [{ type: String }], // Array of string features
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Package", PackageSchema);
