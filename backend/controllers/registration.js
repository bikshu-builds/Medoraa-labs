const PatientRegistration = require("../models/PatientRegistration");
const Counter = require("../models/Counter");
const Sample = require("../models/Sample");

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

        // Fetch sample master details to populate initial testResults array
        let initialTestResults = [];
        if (Array.isArray(testIds) && testIds.length > 0) {
            const samples = await Sample.find({ _id: { $in: testIds } });
            initialTestResults = samples.map(s => ({
                testId: s._id,
                testName: s.testName,
                resultValue: "",
                unit: "",
                referenceRange: s.referenceRange || "-",
                flag: "Normal"
            }));
        }

        const registration = await PatientRegistration.findByIdAndUpdate(
            req.params.id,
            { tests: testIds, testResults: initialTestResults },
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

// @desc    Update authorization status & test result values
exports.updateRegistrationAuthorization = async (req, res) => {
    try {
        const {
            testResults,
            authorizationStatus,
            notes,
            authorizedBy,
            patientName,
            age,
            gender,
            mobileNumber,
            address,
            referredBy
        } = req.body;

        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const updateData = {
            authorizationStatus: authorizationStatus || "AUTHORIZED",
            notes: notes || "",
            authorizedBy: authorizedBy || (req.user ? req.user.name : "Medical Officer"),
            authorizedAt: `${dateStr} ${timeStr}`
        };

        if (patientName !== undefined) updateData.patientName = patientName;
        if (age !== undefined) updateData.age = age;
        if (gender !== undefined) updateData.gender = gender;
        if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
        if (address !== undefined) updateData.address = address;
        if (referredBy !== undefined) updateData.referredBy = referredBy;

        if (Array.isArray(testResults)) {
            updateData.testResults = testResults;
        }

        const registration = await PatientRegistration.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("tests");

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        res.status(200).json({
            success: true,
            message: `Report ${authorizationStatus || 'updated'} successfully`,
            data: registration
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Download Pathology PDF Report (Authorized Only)
// @route   GET /api/admin/registrations/:id/pdf
exports.downloadReportPDF = async (req, res) => {
    try {
        const { generatePathologyPDF } = require("../services/pdfGenerator");
        const registration = await PatientRegistration.findById(req.params.id).populate("tests");
        if (!registration) {
            return res.status(404).json({ success: false, message: "Patient registration record not found" });
        }

        // Enforce Authorization-Only gate
        if (registration.authorizationStatus !== "AUTHORIZED") {
            return res.status(403).json({
                success: false,
                message: "Download blocked — Pathology report is awaiting formal pathologist sign-off."
            });
        }

        // Generate PDF Buffer
        const pdfBuffer = await generatePathologyPDF(registration);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename=Pathology_Report_${registration.registrationNumber || registration._id}.pdf`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        return res.send(pdfBuffer);
    } catch (err) {
        console.error("PDF Generation Error:", err);
        return res.status(500).json({ success: false, message: "Error generating PDF report: " + err.message });
    }
};



