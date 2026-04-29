const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true }, // Redundant but useful for quick display
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
    date: { type: Date, required: true },
    time: { type: String, required: true },

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
        default: "Walk-in"
    },
    doctorReferral: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    totalAmount: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ["Pending", "Paid", "Failed"], 
        default: "Pending" 
    },
    paymentMethod: { 
        type: String, 
        enum: ["Cash", "UPI", "Card", "Online", "Corporate Billing"],
        default: "Cash"
    },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    status: { 
        type: String, 
        enum: [
            "Order Received", 
            "Scheduled",
            "Assigned", 
            "Agent En Route", 
            "Arrived", 
            "Sample Collected", 
            "Payment Completed", 
            "Dispatched to Lab", 
            "Lab Received", 
            "In Testing",
            "Report Generated",
            "Completed",
            "Cancelled"
        ], 
        default: "Order Received" 
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
