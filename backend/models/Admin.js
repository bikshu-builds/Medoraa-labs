const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "registration", "authorization", "inventory"], default: "admin" },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

// Hash password before saving
AdminSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
AdminSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
