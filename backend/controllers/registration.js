const PatientRegistration = require("../models/PatientRegistration");
const Counter = require("../models/Counter");

// Helper to get auto-generated system date, time, and YYYYMMDD code
const getFormattedDateTime = () => {
    const now = new Date();
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`; // DD-MM-YYYY
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    
    const timeStr = `${hoursStr}:${minutes}:${seconds} ${ampm}`; // HH:MM:SS AM/PM
    
    const dateCodeStr = `${year}${month}${day}`; // YYYYMMDD
    
    return { dateStr, timeStr, dateCodeStr };
};

// @desc    Register a new patient
// @route   POST /api/admin/registrations
exports.addRegistration = async (req, res) => {
    try {
        const {
            location,
            patientName,
            age,
            gender,
            mobileNumber,
            address,
            referredBy,
            sampleDrawnBy,
            sampleReceived
        } = req.body;

        // Auto-generate Date & Time & Date Code
        const { dateStr, timeStr, dateCodeStr } = getFormattedDateTime();

        // Daily sequential counter key (e.g. registrationCode-20260701)
        const counterId = `registrationCode-${dateCodeStr}`;
        const counter = await Counter.findByIdAndUpdate(
            { _id: counterId },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        // Generate REG-YYYYMMDD-XXXX number
        const registrationNumber = `REG-${dateCodeStr}-${String(counter.seq).padStart(4, '0')}`;

        const registration = await PatientRegistration.create({
            location,
            patientName,
            age,
            gender,
            mobileNumber,
            address,
            referredBy,
            sampleDrawnBy,
            sampleReceived,
            registrationDate: dateStr,
            registrationTime: timeStr,
            registrationNumber,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            data: registration
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all patient registrations
// @route   GET /api/admin/registrations
exports.getRegistrations = async (req, res) => {
    try {
        const registrations = await PatientRegistration.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email")
            .populate("tests");
        res.status(200).json({ success: true, data: registrations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update selected tests/samples for a registration
// @route   PUT /api/admin/registrations/:id/tests
exports.updateRegistrationTests = async (req, res) => {
    try {
        const { testIds } = req.body;
        const registration = await PatientRegistration.findByIdAndUpdate(
            req.params.id,
            { tests: testIds },
            { new: true }
        ).populate("tests");

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        res.status(200).json({
            success: true,
            message: "Tests associated successfully",
            data: registration
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

