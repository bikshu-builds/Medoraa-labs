const mongoose = require("mongoose");

const SupportTicketSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ["Booking Issue", "Report Issue", "Payment Issue", "Home Collection", "General Inquiry", "Other"]
    },
    status: { 
        type: String, 
        enum: ["Open", "In Progress", "Resolved", "Closed"], 
        default: "Open" 
    },
    adminResponse: { type: String },
    priority: { 
        type: String, 
        enum: ["Low", "Medium", "High"], 
        default: "Low" 
    }
}, { timestamps: true });

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);
