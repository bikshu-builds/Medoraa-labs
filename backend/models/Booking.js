const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true }, // Redundant but useful for quick display
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
    date: { type: Date, required: true },
    time: { type: String, required: true },
    bookingType: { 
        type: String, 
        enum: ["Lab Visit", "Home Collection"], 
        required: true 
    },
    totalAmount: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ["Pending", "Paid", "Failed"], 
        default: "Pending" 
    },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    status: { 
        type: String, 
        enum: ["Scheduled", "In Progress", "Completed", "Cancelled"], 
        default: "Scheduled" 
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
