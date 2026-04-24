const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { 
        type: String, 
        enum: ["Lab Staff", "Marketing Team", "Home Collection Staff"], 
        required: true 
    },
    address: { type: String },
    profileImage: { type: String },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema);
