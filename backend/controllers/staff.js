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
const VisitLog = require("../models/VisitLog");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper: Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

exports.autoAssignCollectionAgent = async (bookingId, location) => {
    try {
        const booking = await Booking.findById(bookingId).populate("patient");
        if (!booking) return null;

        // Find all active Sample Collection Team staff
        const agents = await Staff.find({ 
            role: "Sample Collection Team", 
            status: "Active" 
        });

        if (agents.length === 0) return null;

        let nearestAgent = null;
        let minDistance = Infinity;

        // Simple location-based assignment
        // In real-world, we'd use MongoDB $near query with 2dsphere index
        for (const agent of agents) {
            if (agent.currentLocation && agent.currentLocation.lat) {
                const dist = calculateDistance(
                    location.lat, location.lng, 
                    agent.currentLocation.lat, agent.currentLocation.lng
                );
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestAgent = agent;
                }
            }
        }

        // Fallback: If no agent has location, pick the first active one or one with matching route
        if (!nearestAgent) {
            nearestAgent = agents[0];
        }

        // Create Collection record in 'Order Received' status for manual claiming
        const collection = new Collection({
            booking: booking._id,
            assignedStaff: null, // Pool for self-assignment
            scheduledDate: booking.date,
            timeSlot: booking.time,
            location: {
                type: "Point",
                coordinates: [location.lng, location.lat]
            },
            status: "Order Received"
        });
        await collection.save();

        // Update Booking
        booking.status = "Order Received";
        await booking.save();

        return null; // No auto-assignment made
    } catch (err) {
        console.error("Auto-assignment error:", err);
        return null;
    }
};

exports.updateLiveLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        await Staff.findByIdAndUpdate(req.user.id, {
            currentLocation: { lat, lng }
        });
        res.status(200).json({ success: true, message: "Location updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

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
        const { type } = req.query; // 'assigned' or 'unassigned'
        let query = { assignedStaff: req.user.id };
        
        if (type === "unassigned") {
            query = { assignedStaff: null, status: "Order Received" };
        }

        const collections = await Collection.find(query)
            .populate({
                path: "booking",
                populate: { path: "patient tests" }
            })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: collections });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.claimCollection = async (req, res) => {
    try {
        const { collectionId } = req.body;
        const collection = await Collection.findById(collectionId);
        
        if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });
        if (collection.assignedStaff) {
            return res.status(400).json({ success: false, message: "This collection has already been claimed by another agent." });
        }

        collection.assignedStaff = req.user.id;
        collection.status = "Assigned";
        await collection.save();

        // Sync booking status
        await Booking.findByIdAndUpdate(collection.booking, { 
            assignedStaff: req.user.id,
            status: "Assigned"
        });

        res.status(200).json({ success: true, message: "Collection claimed successfully", data: collection });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCollectionStatus = async (req, res) => {
    try {
        const { 
            collectionId, 
            status, 
            doctorReference, 
            medicalNotes, 
            patientSignature,
            paymentMethod,
            paymentAmount,
            transactionId
        } = req.body;

        const collection = await Collection.findById(collectionId).populate("booking");
        if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });

        collection.status = status;
        
        if (doctorReference) collection.doctorReference = doctorReference;
        if (medicalNotes) collection.medicalNotes = medicalNotes;
        if (patientSignature) collection.patientSignature = patientSignature;

        if (status === "Payment Completed") {
            collection.paymentDetails = {
                method: paymentMethod,
                amount: paymentAmount || collection.booking.totalAmount,
                transactionId: transactionId,
                status: "Completed"
            };
            
            // Update Booking payment status
            const booking = await Booking.findById(collection.booking._id);
            booking.paymentStatus = "Paid";
            booking.status = "Payment Completed";
            await booking.save();
        }

        if (status === "Sample Collected") {
            collection.completedAt = new Date();
            // Trigger sample creation for each test in booking
            const booking = await Booking.findById(collection.booking).populate("tests");
            
            // Update Booking status
            booking.status = "Sample Collected";
            await booking.save();

            for (const test of booking.tests) {
                const sampleId = `SMP-${Math.floor(100000 + Math.random() * 900000)}`;
                await new Sample({
                    sampleId,
                    booking: booking._id,
                    patient: booking.patient,
                    test: test._id,
                    collectedBy: req.user.id,
                    collectionTime: new Date(),
                    status: "Collected",
                    notes: medicalNotes
                }).save();
            }
        }

        // Sync booking status for other transitions
        if (["Agent En Route", "Arrived", "Dispatched to Lab"].includes(status)) {
            await Booking.findByIdAndUpdate(collection.booking, { status });
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

        if (sample.status !== "Pending") {
            return res.status(400).json({ 
                success: false, 
                message: `This sample has already been verified and marked as '${sample.status}'.`,
                isAlreadyVerified: true
            });
        }

        sample.status = "Received";
        sample.receivedBy = req.user.id;
        sample.receptionTime = new Date();
        await sample.save();

        const populatedSample = await Sample.findById(sample._id)
            .populate("patient", "name")
            .populate("test", "name tat reportTimeHours");

        res.status(200).json({ success: true, message: "Sample marked as Received", data: populatedSample });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getReceivedSamples = async (req, res) => {
    try {
        const samples = await Sample.find({ status: { $in: ["Received", "In Testing", "Completed"] } })
            .populate("patient", "name patientId")
            .populate("test", "name tat")
            .sort({ receptionTime: -1 })
            .limit(100);

        res.status(200).json({ success: true, data: samples });
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
            const newPatientData = { 
                ...patientData, 
                patientId, 
                sourceType: sourceType || "Walk-in" 
            };
            if (!newPatientData.doctorReferral) {
                delete newPatientData.doctorReferral;
            }
            if (!newPatientData.doctorReference) {
                delete newPatientData.doctorReference;
            }
            patient = new Patient(newPatientData);
            await patient.save();
        } else {
            // Update existing patient data if provided
            const immutableFields = ["_id", "patientId", "createdAt", "updatedAt", "__v"];
            Object.keys(patientData).forEach(key => {
                if (immutableFields.includes(key)) return;
                if (key === "password" && !patientData[key]) return;
                patient[key] = patientData[key];
            });
            // Update sourceType if changed
            if (sourceType) patient.sourceType = sourceType;
            await patient.save();
        }

        // 2. Create Booking
        const bookingId = `BK-${Date.now().toString().slice(-6)}`;
        const testDocs = await Test.find({ _id: { $in: tests } });
        const totalAmount = testDocs.reduce((acc, t) => acc + t.price, 0);

        const bookingData = {
            bookingId,
            patient: patient._id,
            patientName: patient.name,
            tests,
            date: new Date(),
            time: new Date().toLocaleTimeString(),
            sourceType: sourceType || "Walk-in",
            totalAmount,
            paymentStatus: "Paid",
            paymentMethod: paymentMethod || "Cash",
            status: "Scheduled"
        };
        if (doctorReferral) {
            bookingData.doctorReferral = doctorReferral;
        }

        const booking = new Booking(bookingData);
        await booking.save();

        // 3. Auto-generate Samples (since it's walk-in, collection happens now)
        const samples = [];
        for (const test of testDocs) {
            const sampleId = `SMP-${Math.floor(100000 + Math.random() * 900000)}`;
            const sample = new Sample({
                sampleId,
                booking: booking._id,
                patient: patient._id,
                test: test._id,
                status: "Pending", // Ready for collection at reception
                notes: "Walk-in collection"
            });
            await sample.save();
            samples.push({
                sampleId,
                testName: test.name,
                patientName: patient.name,
                patientId: patient.patientId
            });
        }

        res.status(201).json({ 
            success: true, 
            message: "Walk-in booking successful", 
            data: {
                booking,
                samples
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.lookup = async (req, res) => {
    try {
        const { query } = req.params;
        
        // Search for Sample by ID
        let sample = await Sample.findOne({ sampleId: query })
            .populate("patient", "name patientId phoneNumber age gender")
            .populate("test", "name price category")
            .populate("booking", "bookingId date status sourceType");

        if (sample) {
            return res.status(200).json({ 
                success: true, 
                type: "Sample", 
                data: sample 
            });
        }

        // Search for Patient by ID or Phone
        let patient = await Patient.findOne({ 
            $or: [{ patientId: query }, { phoneNumber: query }] 
        });

        if (patient) {
            const bookings = await Booking.find({ patient: patient._id }).sort({ createdAt: -1 });
            return res.status(200).json({ 
                success: true, 
                type: "Patient", 
                data: { patient, bookings } 
            });
        }

        res.status(404).json({ success: false, message: "No records found for this query" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getWalkins = async (req, res) => {
    try {
        const walkins = await Booking.find({ 
            sourceType: { $in: ["Walk-in", "Referring Doctor", "Corporate / Camps"] } 
        })
        .populate("patient", "name patientId phoneNumber gender age")
        .sort({ createdAt: -1 })
        .limit(50);

        res.status(200).json({ success: true, data: walkins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate("patient")
            .populate("tests");

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const samples = await Sample.find({ booking: id }).populate("test");

        res.status(200).json({ 
            success: true, 
            data: {
                booking,
                samples
            } 
        });
    } catch (err) {
        console.error("DEBUG: getBookingDetails Error:", err);
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

exports.saveVisitLog = async (req, res) => {
    try {
        const { collectionId, selfieUrl, location, deviceInfo } = req.body;
        const staffId = req.user.id;

        const collection = await Collection.findById(collectionId);
        if (!collection) return res.status(404).json({ success: false, message: "Collection record not found" });

        // Distance Validation (Max 500 meters allowance)
        if (collection.location && collection.location.coordinates) {
            const [targetLng, targetLat] = collection.location.coordinates;
            const distance = calculateDistance(location.lat, location.lng, targetLat, targetLng);
            
            if (distance > 0.5) { // 500 meters
                return res.status(400).json({ 
                    success: false, 
                    message: `Geofence Violation: You are ${distance.toFixed(2)}km away from the scheduled location. Must be within 500m to check-in.`,
                    distance 
                });
            }
        }

        const visitLog = new VisitLog({
            employeeId: staffId,
            collectionId,
            selfieUrl,
            location: {
                type: "Point",
                coordinates: [location.lng, location.lat]
            },
            deviceInfo,
            timestamp: new Date()
        });

        await visitLog.save();

        // Update Collection status to 'Arrived'
        collection.status = "Arrived";
        await collection.save();

        // Sync Booking status
        await Booking.findByIdAndUpdate(collection.booking, { status: "Arrived" });

        res.status(201).json({ 
            success: true, 
            message: "Visit verified and logged successfully", 
            data: visitLog 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
