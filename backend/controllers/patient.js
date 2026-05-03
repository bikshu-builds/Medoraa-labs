const Patient = require("../models/Patient");
const Test = require("../models/Test");
const Booking = require("../models/Booking");
const Billing = require("../models/Billing");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const FamilyMember = require("../models/FamilyMember");
const SupportTicket = require("../models/SupportTicket");
const staffController = require("./staff");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Auth Controllers
exports.identify = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        const patients = await Patient.find({ phoneNumber }).select('_id name age gender');

        if (patients.length === 0) {
            return res.status(200).json({ success: true, exists: false, patients: [] });
        }

        return res.status(200).json({ success: true, exists: true, patients });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, age, dob, gender, bloodGroup, agreedToBloodGroupTest, reasonForTest, medicalHistory } = req.body;

        // Soft warning: if exact name and age exist under same phone
        const existingDuplicate = await Patient.findOne({ phoneNumber, name, age });
        if (existingDuplicate && !req.body.forceRegister) {
            return res.status(409).json({
                success: false,
                message: "A patient with this name and age already exists under this phone number.",
                isDuplicateWarning: true
            });
        }

        const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;

        const patient = new Patient({
            patientId,
            name,
            email,
            phoneNumber,
            password,
            age,
            dob,
            gender,
            bloodGroup,
            agreedToBloodGroupTest,
            reasonForTest,
            medicalHistory: medicalHistory ? [medicalHistory] : [],
            sourceType: "Walk-in"
        });
        await patient.save();

        const token = jwt.sign({ id: patient._id, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ success: true, message: "Registered successfully", token, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password, specificPatientId } = req.body; // identifier can be email or phone

        let query = { $or: [{ email: identifier }, { phoneNumber: identifier }] };
        if (specificPatientId) {
            query = { _id: specificPatientId };
        }

        const patient = await Patient.findOne(query);

        if (!patient || !patient.password) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await patient.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: patient._id, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ success: true, message: "Logged in successfully", token, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



// Profile Controllers
exports.getProfile = async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id)
            .populate("addresses")
            .populate("familyMembers");
        res.status(200).json({ success: true, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        Object.keys(req.body).forEach(key => {
            if (key === "password" && !req.body[key]) return;
            patient[key] = req.body[key];
        });

        await patient.save();
        res.status(200).json({ success: true, message: "Profile updated", data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Test Controllers
exports.getTests = async (req, res) => {
    try {
        const tests = await Test.find({ status: "Active" });
        res.status(200).json({ success: true, data: tests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getSuggestions = async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        let tagsToMatch = [];
        if (patient.age > 40) tagsToMatch.push("Age>40");
        if (patient.gender === "Female") tagsToMatch.push("Female");
        if (patient.gender === "Male") tagsToMatch.push("Men");

        if (patient.medicalHistory && patient.medicalHistory.length > 0) {
            const historyStr = patient.medicalHistory.join(" ").toLowerCase();
            if (historyStr.includes("diabetes") || historyStr.includes("sugar")) tagsToMatch.push("Diabetes");
            if (historyStr.includes("fever")) tagsToMatch.push("Fever");
            if (historyStr.includes("heart") || historyStr.includes("cardiac")) tagsToMatch.push("Cardiac");
            // Add more rules as needed
        }

        if (patient.reasonForTest) {
            const reason = patient.reasonForTest.toLowerCase();
            if (reason.includes("fever")) tagsToMatch.push("Fever");
            if (reason.includes("sugar") || reason.includes("diabetes")) tagsToMatch.push("Diabetes");
        }

        if (tagsToMatch.length === 0) {
            // Default suggestions if no specific tags match
            tagsToMatch.push("Age>40");
        }

        const suggestedTests = await Test.find({
            status: "Active",
            suggestionTags: { $in: tagsToMatch }
        }).limit(5);

        res.status(200).json({ success: true, data: suggestedTests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Booking Controllers
exports.bookTest = async (req, res) => {
    try {
        const { tests, date, time, sourceType, addressId, notes } = req.body;
        const patient = await Patient.findById(req.user.id);

        const bookingId = `BK-${Date.now().toString().slice(-6)}`;

        let totalAmount = 0;
        const testDocs = await Test.find({ _id: { $in: tests } });
        testDocs.forEach(t => totalAmount += t.price);

        const booking = new Booking({
            bookingId,
            patient: req.user.id,
            patientName: patient.name,
            tests,
            date,
            time,
            sourceType,
            totalAmount,
            notes
        });

        await booking.save();

        // Create Billing record
        const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
        const billing = new Billing({
            invoiceId,
            patient: req.user.id,
            patientName: patient.name,
            amount: totalAmount,
            totalAmount,
            status: "Pending"
        });
        await billing.save();

        // 4. Auto-assign if Home Collection
        if (sourceType === "Home Collection") {
            if (addressId) {
                const address = await Address.findById(addressId);
                if (address && address.coordinates && address.coordinates.latitude) {
                    await staffController.autoAssignCollectionAgent(booking._id, {
                        lat: address.coordinates.latitude,
                        lng: address.coordinates.longitude
                    });
                } else {
                    console.warn("No coordinates found for Home Collection booking - skipping auto-assignment");
                }
            } else {
                console.warn("No address selected for Home Collection booking - skipping auto-assignment");
            }
        }

        res.status(201).json({ success: true, message: "Booking created", data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({ patient: req.user.id }).populate("tests");
        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({ patient: req.user.id }).populate("test");
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getBilling = async (req, res) => {
    try {
        const bills = await Billing.find({ patient: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bills });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Notification Controllers
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id },
            { readStatus: true }
        );
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Cart Controllers
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ patient: req.user.id }).populate("items.test");
        if (!cart) {
            cart = new Cart({ patient: req.user.id, items: [] });
            await cart.save();
        }
        res.status(200).json({ success: true, data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { testId } = req.body;
        let cart = await Cart.findOne({ patient: req.user.id });
        if (!cart) {
            cart = new Cart({ patient: req.user.id, items: [] });
        }

        const exists = cart.items.find(item => item.test.toString() === testId);
        if (!exists) {
            cart.items.push({ test: testId });
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Added to cart", data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { testId } = req.params;
        const cart = await Cart.findOne({ patient: req.user.id });
        if (cart) {
            cart.items = cart.items.filter(item => item.test.toString() !== testId);
            await cart.save();
        }
        res.status(200).json({ success: true, message: "Removed from cart", data: cart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Family & Address Controllers
exports.addFamilyMember = async (req, res) => {
    try {
        const familyMember = new FamilyMember({ ...req.body, patient: req.user.id });
        await familyMember.save();
        await Patient.findByIdAndUpdate(req.user.id, { $push: { familyMembers: familyMember._id } });
        res.status(201).json({ success: true, message: "Family member added", data: familyMember });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const address = new Address({ ...req.body, patient: req.user.id });
        await address.save();
        await Patient.findByIdAndUpdate(req.user.id, { $push: { addresses: address._id } });
        res.status(201).json({ success: true, message: "Address added", data: address });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
        if (!address) return res.status(404).json({ success: false, message: "Address not found" });
        await Patient.findByIdAndUpdate(req.user.id, { $pull: { addresses: address._id } });
        res.status(200).json({ success: true, message: "Address deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Support Controllers
exports.submitSupport = async (req, res) => {
    try {
        const ticket = new SupportTicket({ ...req.body, patient: req.user.id });
        await ticket.save();
        res.status(201).json({ success: true, message: "Ticket submitted", data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id).select('name');
        const bookings = await Booking.countDocuments({ patient: req.user.id });
        const pendingReports = await Report.countDocuments({ patient: req.user.id, status: "Pending" });
        const completedTests = await Booking.countDocuments({ patient: req.user.id, status: "Completed" });
        const homeCollections = await Booking.countDocuments({ patient: req.user.id, sourceType: "Home Collection" });

        const recentReports = await Report.find({ patient: req.user.id }).sort({ createdAt: -1 }).limit(3).populate("test");
        const latestNotifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: {
                patientName: patient.name,
                stats: { bookings, pendingReports, completedTests, homeCollections },
                recentReports,
                latestNotifications
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
