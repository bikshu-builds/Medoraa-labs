const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
    {
        labName: {
            type: String,
            required: true,
            trim: true,
        },
        hospital: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Lab", labSchema);
