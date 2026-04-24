const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
    labName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    logo: { type: String },
    smtpSettings: {
        host: { type: String },
        port: { type: Number },
        user: { type: String },
        pass: { type: String }
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model("Setting", SettingSchema);
