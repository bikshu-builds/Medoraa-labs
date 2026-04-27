const mongoose = require("mongoose");

const SampleSchema = new mongoose.Schema({
    sampleId: { type: String, required: true, unique: true }, // Barcode/QR content
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    containerType: { type: String }, // EDTA, Serum, etc.
    status: {
        type: String,
        enum: ["Pending", "Collected", "Received", "In Testing", "Completed", "Rejected"],
        default: "Pending"
    },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    collectionTime: { type: Date },
    receptionTime: { type: Date },
    qrCode: { type: String }, // Path or Base64
    notes: { type: String },
    collectionProof: {
        selfieUrl: { type: String },
        gpsLocation: {
            lat: { type: Number },
            lng: { type: Number }
        },
        timestamp: { type: Date },
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
    }
}, { timestamps: true });

module.exports = mongoose.model("Sample", SampleSchema);
