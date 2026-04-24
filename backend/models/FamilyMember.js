const mongoose = require("mongoose");

const FamilyMemberSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { 
        type: String, 
        enum: ["Male", "Female", "Other"], 
        required: true 
    },
    relation: { 
        type: String, 
        required: true,
        enum: ["Spouse", "Child", "Parent", "Sibling", "Other"]
    },
    medicalHistory: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("FamilyMember", FamilyMemberSchema);
