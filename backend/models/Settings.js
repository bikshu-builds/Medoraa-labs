const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        upiQrCode: {
            type: String,
            default: "",
        },
        upiId: {
            type: String,
            trim: true,
            default: "",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
