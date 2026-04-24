const mongoose = require("mongoose");

const DispatchSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    channels: [{
        type: { type: String, enum: ["WhatsApp", "Email", "Dashboard", "Hardcopy"] },
        status: { type: String, enum: ["Pending", "Sent", "Delivered", "Failed"], default: "Pending" },
        sentAt: { type: Date },
        trackingId: { type: String }
    }],
    dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    recipientContact: { type: String }, // Phone or Email
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Dispatch", DispatchSchema);
