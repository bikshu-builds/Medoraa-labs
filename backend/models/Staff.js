const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StaffSchema = new mongoose.Schema({
    staffId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    role: { 
        type: String, 
        enum: [
            "Sample Collection Team", 
            "Sample Processing Team", 
            "Report Approval Team", 
            "Dispatch Team", 
            "Reception", 
            "Admin Staff"
        ], 
        required: true 
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    profileImage: { type: String },
    assignedRoute: { type: String }, // For collection team
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    lastLogin: { type: Date }
}, { timestamps: true });

StaffSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

StaffSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Staff", StaffSchema);
