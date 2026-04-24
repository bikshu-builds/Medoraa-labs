const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ["Delayed samples", "Missed collection", "System failure", "Failed report delivery"], 
        required: true 
    },
    message: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    status: { type: String, enum: ["Active", "Resolved"], default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model("Alert", AlertSchema);
