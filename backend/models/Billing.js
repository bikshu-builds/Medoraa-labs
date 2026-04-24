const mongoose = require("mongoose");

const BillingSchema = new mongoose.Schema({
    invoiceId: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true },
    testName: { type: String },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Cash", "Card", "UPI", "Online"], default: "Cash" },
    status: { type: String, enum: ["Paid", "Pending", "Failed"], default: "Pending" },
    paymentDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Billing", BillingSchema);
