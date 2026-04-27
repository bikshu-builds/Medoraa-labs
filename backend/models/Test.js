const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: [
            "Diabetes / Sugar", 
            "Liver (Hepatic)", 
            "Kidney / Renal", 
            "Heart / Cardiac", 
            "Thyroid / Hormones", 
            "Infections / Fever", 
            "Immunology / Autoimmune", 
            "Microbiology", 
            "General Health Profiles", 
            "Cancer Markers", 
            "Bone / Mineral", 
            "Urine / Stool",
            "Other"
        ]
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
    tat: { type: String }, // Turnaround Time string representation
    reportTimeHours: { type: Number, default: 24 }, // Numerical representation for dynamic calculation
    sampleType: { type: String }, // e.g., "Blood", "Urine"
    isPanel: { type: Boolean, default: false },
    includedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }],
    suggestionTags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("Test", TestSchema);
