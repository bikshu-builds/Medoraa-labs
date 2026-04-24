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
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Auth Controllers
exports.register = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, age, gender } = req.body;

        let patient = await Patient.findOne({ phoneNumber });
        if (patient && patient.password) {
            return res.status(400).json({ success: false, message: "Patient already exists" });
        }

        const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        if (patient) {
            patient.name = name;
            patient.email = email;
            patient.password = hashedPassword;
            patient.age = age;
            patient.gender = gender;
            await patient.save();
        } else {
            patient = new Patient({
                patientId,
                name,
                email,
                phoneNumber,
                password: hashedPassword,
                age,
                gender,
                sourceType: "Walk-in" // Default
            });
            await patient.save();
        }

        const token = jwt.sign({ id: patient._id, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ success: true, message: "Registered successfully", token, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or phone

        const patient = await Patient.findOne({
            $or: [{ email: identifier }, { phoneNumber: identifier }]
        });

        if (!patient || !patient.password) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: patient._id, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ success: true, message: "Logged in successfully", token, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        let patient = await Patient.findOne({ phoneNumber });
        if (!patient) {
            const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
            patient = new Patient({
                patientId,
                name: "Guest User",
                phoneNumber,
                age: 0,
                gender: "Other",
                sourceType: "Walk-in"
            });
        }

        patient.otp = {
            code: otpCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        };
        await patient.save();

        // In production, send SMS here. For now, return in response
        res.status(200).json({ success: true, message: "OTP sent", otp: otpCode });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        const patient = await Patient.findOne({ phoneNumber });

        if (!patient || !patient.otp || patient.otp.code !== code || patient.otp.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        patient.isVerified = true;
        patient.otp = undefined;
        await patient.save();

        const token = jwt.sign({ id: patient._id, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ success: true, message: "OTP verified", token, data: patient });
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
        const patient = await Patient.findByIdAndUpdate(req.user.id, req.body, { new: true });
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

// Booking Controllers
exports.bookTest = async (req, res) => {
    try {
        const { tests, date, time, bookingType, addressId, notes } = req.body;
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
            bookingType,
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
        res.status(200).json({ success: true, message: "Removed from cart" });
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
        const bookings = await Booking.countDocuments({ patient: req.user.id });
        const pendingReports = await Report.countDocuments({ patient: req.user.id, status: "Pending" });
        const completedTests = await Booking.countDocuments({ patient: req.user.id, status: "Completed" });
        
        const recentReports = await Report.find({ patient: req.user.id }).sort({ createdAt: -1 }).limit(3).populate("test");
        const latestNotifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: {
                stats: { bookings, pendingReports, completedTests },
                recentReports,
                latestNotifications
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
