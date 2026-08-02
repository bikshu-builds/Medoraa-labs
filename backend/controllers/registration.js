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
        const { testIds, subtotal, discount, discountType, totalAmount, paidAmount, paymentMethod, paymentStatus } = req.body;

        // Fetch sample master details to populate initial testResults array
        let initialTestResults = [];
        let calculatedSubtotal = 0;
        if (Array.isArray(testIds) && testIds.length > 0) {
            const samples = await Sample.find({ _id: { $in: testIds } });
            initialTestResults = samples.map(s => ({
                testId: s._id,
                testName: s.testName,
                resultValue: "",
                unit: (s.units && s.units !== "-") ? s.units : ((s.unit && s.unit !== "-") ? s.unit : ""),
                referenceRange: s.referenceRange || "-",
                organ: s.organ || "-",
                category: s.category || "-",
                method: s.method || "-",
                flag: "Normal"
            }));
            calculatedSubtotal = samples.reduce((sum, s) => sum + (parseFloat(s.patientPrice) || 0), 0);
        }

        const finalSubtotal = subtotal !== undefined ? subtotal : calculatedSubtotal;
        const finalDiscount = discount !== undefined ? discount : 0;
        const finalDiscountType = discountType !== undefined ? discountType : "fixed";

        let calculatedDiscountVal = finalDiscount;
        if (finalDiscountType === "percentage") {
            // Only convert if finalDiscount is passed as raw rate (e.g. <= 100) and subtotal was not explicitly sent with evaluated rupee discount
            if (subtotal === undefined && finalDiscount <= 100) {
                calculatedDiscountVal = (finalSubtotal * finalDiscount) / 100;
            } else if (subtotal !== undefined && finalDiscount <= 100 && req.body.isRawPercentage) {
                calculatedDiscountVal = (finalSubtotal * finalDiscount) / 100;
            }
        }
        calculatedDiscountVal = Math.min(finalSubtotal, Math.max(0, calculatedDiscountVal));

        const finalTotalAmount = totalAmount !== undefined ? totalAmount : Math.max(0, finalSubtotal - calculatedDiscountVal);
        const finalPaidAmount = paidAmount !== undefined ? paidAmount : finalTotalAmount;

        const updateData = {
            tests: testIds,
            testResults: initialTestResults,
            subtotal: finalSubtotal,
            discount: calculatedDiscountVal,
            discountType: finalDiscountType,
            totalAmount: finalTotalAmount,
            paidAmount: finalPaidAmount
        };

        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

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
        const registration = await PatientRegistration.findById(req.params.id)
            .populate("tests")
            .populate("testResults.testId");
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

// @desc    Transfer/Outsource sample logistics to reference lab
// @route   PUT /api/admin/registrations/:id/transfer-sample
exports.transferRegistrationSample = async (req, res) => {
    try {
        const {
            modeOfTransfer,
            referenceLab,
            contactPersonName,
            contactNumber,
            vehicleNumber,
            courierAgency,
            docketNumber,
            remarks,
            transferredTestIds,
            transferredTestNames,
            testStatuses
        } = req.body;

        const registration = await PatientRegistration.findByIdAndUpdate(
            req.params.id,
            {
                sampleTransfer: {
                    modeOfTransfer: modeOfTransfer || "",
                    referenceLab: referenceLab || "",
                    contactPersonName: contactPersonName || "",
                    contactNumber: contactNumber || "",
                    vehicleNumber: vehicleNumber || "",
                    courierAgency: courierAgency || "",
                    docketNumber: docketNumber || "",
                    remarks: remarks || "",
                    transferredTestIds: transferredTestIds || [],
                    transferredTestNames: transferredTestNames || [],
                    testStatuses: testStatuses || [],
                    transferredAt: new Date()
                }
            },
            { new: true }
        ).populate("tests");

        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        res.status(200).json({
            success: true,
            message: "Sample transfer details saved successfully",
            data: registration
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Download Thermal Outsource Transfer Label PDF (100mm x 150mm)
// @route   GET /api/admin/registrations/:id/transfer-label-pdf
exports.downloadTransferLabelPDF = async (req, res) => {
    try {
        const { generateTransferLabelPDF } = require("../services/pdfGenerator");
        const Hospital = require("../models/Hospital");

        const registration = await PatientRegistration.findById(req.params.id)
            .populate("tests");
            
        if (!registration) {
            return res.status(404).json({ success: false, message: "Patient registration record not found" });
        }

        const transfer = registration.sampleTransfer || {};
        let hospitalDoc = null;
        if (transfer.referenceLab) {
            hospitalDoc = await Hospital.findOne({
                $or: [
                    { hospitalName: new RegExp(`^${transfer.referenceLab.trim()}$`, "i") },
                    { "labs.labName": new RegExp(`^${transfer.referenceLab.trim()}$`, "i") }
                ]
            });
        }

        const pdfBuffer = await generateTransferLabelPDF(registration, hospitalDoc);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename=Transfer_Label_${registration.registrationNumber || registration._id}.pdf`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        return res.send(pdfBuffer);
    } catch (err) {
        console.error("Transfer Label PDF Generation Error:", err);
        return res.status(500).json({ success: false, message: "Error generating transfer label PDF: " + err.message });
    }
};

// @desc    Download Patient Receipt PDF
// @route   GET /api/admin/registrations/:id/receipt-pdf
exports.downloadReceiptPDF = async (req, res) => {
    try {
        const { generateReceiptPDF } = require("../services/pdfGenerator");

        const registration = await PatientRegistration.findById(req.params.id)
            .populate("tests");
            
        if (!registration) {
            return res.status(404).json({ success: false, message: "Patient registration record not found" });
        }

        const pdfBuffer = await generateReceiptPDF(registration);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename=Receipt_${registration.registrationNumber || registration._id}.pdf`
        );
        res.setHeader("Content-Length", pdfBuffer.length);

        return res.send(pdfBuffer);
    } catch (err) {
        console.error("Receipt PDF Generation Error:", err);
        return res.status(500).json({ success: false, message: "Error generating receipt PDF: " + err.message });
    }
};






