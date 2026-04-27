const Staff = require("../models/Staff");
const Sample = require("../models/Sample");
const Collection = require("../models/Collection");
const HospitalOrder = require("../models/HospitalOrder");
const LabResult = require("../models/LabResult");
const Approval = require("../models/Approval");
const Dispatch = require("../models/Dispatch");
const Booking = require("../models/Booking");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Test = require("../models/Test");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Auth
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const staff = await Staff.findOne({ email });

        if (!staff || staff.status === "Inactive") {
            return res.status(401).json({ success: false, message: "Invalid credentials or account inactive" });
        }

        const isMatch = await staff.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: staff._id, role: staff.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "12h" }
        );

        staff.lastLogin = new Date();
        await staff.save();

        res.status(200).json({ success: true, message: "Logged in successfully", token, data: staff });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Dashboard Stats
exports.getDashboard = async (req, res) => {
    try {
        const staffId = req.user.id;
        const role = req.user.role;

        let stats = {};

        if (role === "Sample Collection Team") {
            stats.pendingCollections = await Collection.countDocuments({ assignedStaff: staffId, status: { $ne: "Collected" } });
            stats.completedToday = await Collection.countDocuments({ 
                assignedStaff: staffId, 
                status: "Collected",
                updatedAt: { $gte: new Date().setHours(0,0,0,0) }
            });
        }

        if (role === "Sample Processing Team") {
            stats.pendingReception = await Sample.countDocuments({ status: "Pending" });
            stats.inTesting = await Sample.countDocuments({ status: "In Testing" });
        }

        if (role === "Report Approval Team") {
            stats.pendingApprovals = await LabResult.countDocuments({ status: "Submitted" });
        }

        if (role === "Dispatch Team") {
            stats.pendingDispatch = await Dispatch.countDocuments({ "channels.status": "Pending" });
        }

        // Common stats
        const activeOrders = await Booking.find({ status: { $ne: "Completed" } }).limit(5).populate("patient tests");
        const notifications = []; // Mock for now

        res.status(200).json({ success: true, data: { stats, activeOrders, notifications } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Workflow: Collections
exports.getCollections = async (req, res) => {
    try {
        const collections = await Collection.find({ assignedStaff: req.user.id })
            .populate({
                path: "booking",
                populate: { path: "patient tests" }
            })
            .sort({ scheduledDate: 1 });
        res.status(200).json({ success: true, data: collections });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCollectionStatus = async (req, res) => {
    try {
        const { collectionId, status, paymentCollected, paymentMethod } = req.body;
        const collection = await Collection.findById(collectionId);
        if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });

        collection.status = status;
        if (paymentCollected) collection.paymentCollected = paymentCollected;
        if (paymentMethod) collection.paymentMethod = paymentMethod;
        
        if (status === "Collected") {
            collection.completedAt = new Date();
            // Trigger sample creation for each test in booking
            const booking = await Booking.findById(collection.booking).populate("tests");
            for (const test of booking.tests) {
                const sampleId = `SMP-${Math.floor(100000 + Math.random() * 900000)}`;
                await new Sample({
                    sampleId,
                    booking: booking._id,
                    patient: booking.patient,
                    test: test._id,
                    collectedBy: req.user.id,
                    collectionTime: new Date(),
                    status: "Collected"
                }).save();
            }
        }

        await collection.save();
        res.status(200).json({ success: true, message: `Status updated to ${status}`, data: collection });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Workflow: Sample Reception
exports.receiveSample = async (req, res) => {
    try {
        const { sampleId } = req.body; // QR/Barcode content
        const sample = await Sample.findOne({ sampleId });
        if (!sample) return res.status(404).json({ success: false, message: "Sample not found" });

        sample.status = "Received";
        sample.receivedBy = req.user.id;
        sample.receptionTime = new Date();
        await sample.save();

        res.status(200).json({ success: true, message: "Sample marked as Received", data: sample });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Workflow: Lab Testing
exports.startTesting = async (req, res) => {
    try {
        const { sampleId } = req.body;
        const sample = await Sample.findOne({ sampleId });
        if (!sample) return res.status(404).json({ success: false, message: "Sample not found" });

        sample.status = "In Testing";
        await sample.save();

        res.status(200).json({ success: true, message: "Testing started", data: sample });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.saveResults = async (req, res) => {
    try {
        const { sampleId, parameters, observations, microscopeImages, status } = req.body;
        const sample = await Sample.findOne({ sampleId }).populate("test booking");
        if (!sample) return res.status(404).json({ success: false, message: "Sample not found" });

        let result = await LabResult.findOne({ sample: sample._id });
        if (!result) {
            result = new LabResult({
                sample: sample._id,
                booking: sample.booking._id,
                test: sample.test._id,
                examiner: req.user.id
            });
        }

        result.parameters = parameters;
        result.observations = observations;
        result.microscopeImages = microscopeImages;
        result.status = status || "Draft";

        await result.save();

        if (status === "Submitted") {
            sample.status = "Completed";
            await sample.save();
        }

        res.status(200).json({ success: true, message: "Results saved", data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Workflow: Approvals
exports.getPendingApprovals = async (req, res) => {
    try {
        const pending = await LabResult.find({ status: "Submitted" })
            .populate("sample booking test examiner");
        res.status(200).json({ success: true, data: pending });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveResult = async (req, res) => {
    try {
        const { resultId, status, comments, digitalSignature } = req.body;
        const result = await LabResult.findById(resultId);
        if (!result) return res.status(404).json({ success: false, message: "Result not found" });

        const approval = new Approval({
            labResult: result._id,
            approver: req.user.id,
            status,
            comments,
            digitalSignature
        });
        await approval.save();

        result.status = status === "Approved" ? "Approved" : "Retest";
        result.approval = approval._id;
        await result.save();

        if (status === "Approved") {
            // Trigger Dispatch creation
            await new Dispatch({
                booking: result.booking,
                channels: [
                    { type: "Dashboard", status: "Sent", sentAt: new Date() },
                    { type: "Email", status: "Pending" },
                    { type: "WhatsApp", status: "Pending" }
                ],
                dispatchedBy: req.user.id
            }).save();
        }

        res.status(200).json({ success: true, message: `Result ${status}`, data: approval });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Walk-in Registration
exports.walkinRegistration = async (req, res) => {
    try {
        const { patientData, tests, paymentMethod, sourceType, doctorReferral } = req.body;
        
        // 1. Find or Create Patient
        let patient = await Patient.findOne({ phoneNumber: patientData.phoneNumber });
        if (!patient) {
            const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
            patient = new Patient({ ...patientData, patientId, sourceType: "Walk-in" });
            await patient.save();
        }

        // 2. Create Booking
        const bookingId = `BK-${Date.now().toString().slice(-6)}`;
        const testDocs = await Test.find({ _id: { $in: tests } });
        const totalAmount = testDocs.reduce((acc, t) => acc + t.price, 0);

        const booking = new Booking({
            bookingId,
            patient: patient._id,
            patientName: patient.name,
            tests,
            date: new Date(),
            time: new Date().toLocaleTimeString(),
            sourceType: sourceType || "Walk-in",
            doctorReferral: doctorReferral || undefined,
            totalAmount,
            paymentStatus: "Paid", // Assuming walk-in pays immediately
            status: "Scheduled"
        });
        await booking.save();

        // 3. Auto-generate Samples (since it's walk-in, collection happens now)
        for (const test of testDocs) {
            const sampleId = `SMP-${Math.floor(100000 + Math.random() * 900000)}`;
            await new Sample({
                sampleId,
                booking: booking._id,
                patient: patient._id,
                test: test._id,
                status: "Pending", // Ready for collection at reception
                notes: "Walk-in collection"
            }).save();
        }

        res.status(201).json({ success: true, message: "Walk-in booking successful", data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Hospital Orders
exports.createHospitalOrder = async (req, res) => {
    try {
        const order = new HospitalOrder({ ...req.body });
        await order.save();
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHospitalOrders = async (req, res) => {
    try {
        const orders = await HospitalOrder.find().populate("tests").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: "active" }).select("name hospitalName branch");
        res.status(200).json({ success: true, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
