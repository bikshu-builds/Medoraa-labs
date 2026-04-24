const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
