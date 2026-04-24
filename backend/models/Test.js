const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ["Blood Tests", "Diabetes", "Thyroid", "Vitamins", "Women Health", "Men Health", "Senior Citizen", "Fever Packages", "Full Body Checkup", "Other"]
    },
    price: { type: Number, required: true },
    description: { type: String },
    preparationInstructions: { type: String }, // e.g., "10-12 hours fasting required"
    isPopular: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ["Active", "Inactive"], 
        default: "Active" 
    },
    tat: { type: String }, // Turnaround Time
    sampleType: { type: String } // e.g., "Blood", "Urine"
}, { timestamps: true });

module.exports = mongoose.model("Test", TestSchema);
