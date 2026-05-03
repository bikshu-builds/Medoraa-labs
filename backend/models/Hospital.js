const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const HospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    branchName: { type: String },
    contactPerson: { type: String },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    gstNumber: { type: String },
    loginUsername: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    creditLimit: { type: Number, default: 0 },
    billingCycle: { type: String }, // e.g., "Monthly"
    hospitalCode: { type: String, required: true, unique: true },
    agreementType: { type: String },
    priceCategory: { type: String },
    customDiscountRules: { type: String },
    apiAccessToken: { type: String }
}, { timestamps: true });

HospitalSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

HospitalSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Hospital", HospitalSchema);
