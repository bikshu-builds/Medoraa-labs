const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    label: { 
        type: String, 
        enum: ["Home", "Work", "Other"], 
        default: "Home" 
    },
    fullAddress: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Address", AddressSchema);
