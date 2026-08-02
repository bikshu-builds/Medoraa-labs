const Settings = require("../models/Settings");

// @desc    Get lab settings (including UPI QR Code)
// @route   GET /api/admin/settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ upiQrCode: "", upiId: "" });
        }
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Upload / Update UPI QR Code image
// @route   POST /api/admin/settings/qr-code
exports.uploadQrCode = async (req, res) => {
    try {
        const { upiQrCode, upiId } = req.body;

        if (!upiQrCode) {
            return res.status(400).json({ success: false, message: "QR Code image data is required" });
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        settings.upiQrCode = upiQrCode;
        if (upiId !== undefined) {
            settings.upiId = upiId;
        }
        if (req.user && req.user.id) {
            settings.updatedBy = req.user.id;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: "UPI QR Code updated successfully",
            data: settings
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete UPI QR Code image
// @route   DELETE /api/admin/settings/qr-code
exports.deleteQrCode = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (settings) {
            settings.upiQrCode = "";
            if (req.user && req.user.id) {
                settings.updatedBy = req.user.id;
            }
            await settings.save();
        }
        res.status(200).json({
            success: true,
            message: "UPI QR Code deleted successfully",
            data: settings || { upiQrCode: "", upiId: "" }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
