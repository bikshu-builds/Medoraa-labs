const mongoose = require("mongoose");

const HomeCollectionSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    gpsLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    selfieProof: { type: String }, // URL to image
    status: { 
        type: String, 
        enum: ["Scheduled", "In Progress", "Collected", "Cancelled"], 
        default: "Scheduled" 
    },
    collectionDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("HomeCollection", HomeCollectionSchema);
