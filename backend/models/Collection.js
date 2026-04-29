const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" }, // Optional for unassigned queue
    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Order Received", "Assigned", "Agent En Route", "Arrived", "Sample Collected", "Payment Completed", "Dispatched to Lab", "Cancelled"], 
        default: "Order Received" 
    },
    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number] // [longitude, latitude]
    },
    doctorReference: { type: String },
    medicalNotes: { type: String },
    patientSignature: { type: String }, // Base64 signature
    paymentDetails: {
        method: { type: String, enum: ["UPI", "Cash", "Card"] },
        amount: { type: Number },
        transactionId: { type: String },
        status: { type: String, enum: ["Pending", "Completed"], default: "Pending" }
    },
    agentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    paymentCollected: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["Cash", "Online", "Pending"] },
    attachments: [{ type: String }], // Photos of prescription/samples
    completedAt: { type: Date }
}, { timestamps: true });

CollectionSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Collection", CollectionSchema);
