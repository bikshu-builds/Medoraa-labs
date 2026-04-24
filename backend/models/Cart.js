const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, unique: true },
    items: [
        {
            test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
