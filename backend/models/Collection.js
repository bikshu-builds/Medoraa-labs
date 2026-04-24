const mongoose = require("mongoose");

const CollectionSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { 
        type: String, 
        enum: ["Assigned", "On the way", "At Location", "Collected", "Cancelled"], 
        default: "Assigned" 
    },
    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number] // [longitude, latitude]
    },
    paymentCollected: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["Cash", "Online", "Pending"] },
    attachments: [{ type: String }], // Photos of prescription/samples
    completedAt: { type: Date }
}, { timestamps: true });

CollectionSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Collection", CollectionSchema);
