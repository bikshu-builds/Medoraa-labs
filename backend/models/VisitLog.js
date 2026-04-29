const mongoose = require("mongoose");

const VisitLogSchema = new mongoose.Schema({
    visitId: { type: String, required: true, unique: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    employeeId: { type: String, required: true }, // For quick lookup/display
    staffName: { type: String, required: true },
    
    timestamp: { type: Date, default: Date.now },
    
    location: {
        type: { type: String, default: "Point" },
        coordinates: [Number] // [longitude, latitude]
    },
    
    selfieUrl: { type: String, required: true },
    deviceInfo: {
        model: String,
        platform: String,
        version: String
    },
    
    isDuplicate: { type: Boolean, default: false },
    fakeGpsDetected: { type: Boolean, default: false },
    
    notes: String
}, { timestamps: true });

VisitLogSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("VisitLog", VisitLogSchema);
