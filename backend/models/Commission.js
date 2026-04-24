const mongoose = require("mongoose");

const CommissionSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientCount: { type: Number, default: 0 },
    commissionPercentage: { type: Number, required: true },
    totalCommission: { type: Number, default: 0 },
    month: { type: String, required: true }, // Format: "YYYY-MM"
    status: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" }
}, { timestamps: true });

module.exports = mongoose.model("Commission", CommissionSchema);
