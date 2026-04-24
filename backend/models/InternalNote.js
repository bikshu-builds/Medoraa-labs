const mongoose = require("mongoose");

const InternalNoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    relatedModule: { type: String },
    relatedId: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    adminName: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("InternalNote", InternalNoteSchema);
