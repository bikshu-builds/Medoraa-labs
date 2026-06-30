const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const DoctorPayment = require("../models/DoctorPayment");
const jwt = require("jsonwebtoken");
const { sendLoginNotification } = require("../config/mailer");

// @desc    Admin Login
// @route   POST /api/admin/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role || "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Fire-and-forget the email notification to avoid blocking the HTTP response
        sendLoginNotification(admin);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role || "admin" }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Dashboard Data
// @route   GET /api/admin/dashboard
exports.getDashboardData = async (req, res) => {
    try {
        const totalDoctors = await Doctor.countDocuments({ isActive: { $ne: false } });
        const totalHospitals = await Hospital.countDocuments();
        const totalAdmins = await Admin.countDocuments();

        // Financial totals
        const financialTotals = await DoctorPayment.aggregate([
            { $match: { isActive: { $ne: false } } },
            {
                $group: {
                    _id: null,
                    totalReferral: { $sum: "$totalReferralAmount" },
                    totalPaid: { $sum: "$paidAmount" },
                    totalDue: { $sum: "$dueAmount" }
                }
            }
        ]);

        const totals = financialTotals[0] || { totalReferral: 0, totalPaid: 0, totalDue: 0 };

        // Hospital Distribution (number of doctors per hospital)
        const hospitalDistribution = await Doctor.aggregate([
            { $match: { isActive: { $ne: false } } },
            {
                $group: {
                    _id: "$hospitalId",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "hospitals",
                    localField: "_id",
                    foreignField: "_id",
                    as: "hospital"
                }
            },
            { $unwind: { path: "$hospital", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: {
                        $cond: {
                            if: { $and: [ { $ne: [ "$hospital.branch", null ] }, { $ne: [ "$hospital.branch", "" ] } ] },
                            then: { $concat: [ "$hospital.hospitalName", " (", "$hospital.branch", ")" ] },
                            else: { $ifNull: [ "$hospital.hospitalName", "Not Associated" ] }
                        }
                    },
                    count: 1
                }
            }
        ]);

        // Top Doctors by Earnings
        const topDoctors = await DoctorPayment.aggregate([
            { $match: { isActive: { $ne: false } } },
            {
                $group: {
                    _id: "$doctorId",
                    totalEarnings: { $sum: "$totalReferralAmount" },
                    paid: { $sum: "$paidAmount" },
                    due: { $sum: "$dueAmount" }
                }
            },
            { $sort: { totalEarnings: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "doctors",
                    localField: "_id",
                    foreignField: "_id",
                    as: "doctor"
                }
            },
            { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: { $ifNull: ["$doctor.doctorName", "Unknown Doctor"] },
                    totalEarnings: 1,
                    paid: 1,
                    due: 1
                }
            }
        ]);

        // Recent Payments
        const recentPayments = await DoctorPayment.aggregate([
            { $match: { isActive: { $ne: false } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "doctors",
                    localField: "doctorId",
                    foreignField: "_id",
                    as: "doctor"
                }
            },
            { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "hospitals",
                    localField: "hospitalId",
                    foreignField: "_id",
                    as: "hospital"
                }
            },
            { $unwind: { path: "$hospital", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    doctorName: { $ifNull: ["$doctor.doctorName", "Unknown Doctor"] },
                    hospitalName: {
                        $cond: {
                            if: { $and: [ { $ne: [ "$hospital.branch", null ] }, { $ne: [ "$hospital.branch", "" ] } ] },
                            then: { $concat: [ "$hospital.hospitalName", " (", "$hospital.branch", ")" ] },
                            else: { $ifNull: [ "$hospital.hospitalName", "Not Associated" ] }
                        }
                    },
                    totalReferralAmount: 1,
                    paidAmount: 1,
                    dueAmount: 1,
                    paymentStatus: 1,
                    createdAt: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalDoctors,
                totalHospitals,
                totalAdmins,
                totalReferral: totals.totalReferral,
                totalPaid: totals.totalPaid,
                totalDue: totals.totalDue,
                hospitalDistribution,
                topDoctors,
                recentPayments
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const Counter = require("../models/Counter");

// @desc    Doctor Management
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ isActive: { $ne: false } }).populate("hospitalId");
        res.status(200).json({ success: true, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addDoctor = async (req, res) => {
    try {
        const {
            doctorName,
            hospitalId,
            degree,
            specialization,
            referralPercentage,
            periodType,
            periodStartDate,
            periodEndDate,
            dateOfBirth,
            gender,
            mobileNumber,
            email,
            reportDeliveryMethod,
            status
        } = req.body;

        const counter = await Counter.findByIdAndUpdate(
            { _id: 'doctorCode' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        const newDoctorCode = `DOC${String(counter.seq).padStart(6, '0')}`;

        const doctor = await Doctor.create({
            doctorCode: newDoctorCode,
            doctorName,
            hospitalId,
            degree,
            specialization,
            referralPercentage: Number(referralPercentage) || 0,
            periodType: periodType || "WEEKLY",
            periodStartDate: periodStartDate || undefined,
            periodEndDate: periodEndDate || undefined,
            dateOfBirth: dateOfBirth || undefined,
            gender,
            mobileNumber,
            email,
            reportDeliveryMethod,
            status,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: doctor
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const {
            doctorName,
            hospitalId,
            degree,
            specialization,
            referralPercentage,
            periodType,
            periodStartDate,
            periodEndDate,
            dateOfBirth,
            gender,
            mobileNumber,
            email,
            reportDeliveryMethod,
            status
        } = req.body;

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
                doctorName,
                hospitalId,
                degree,
                specialization,
                referralPercentage: Number(referralPercentage) || 0,
                periodType: periodType || "WEEKLY",
                periodStartDate: periodStartDate || undefined,
                periodEndDate: periodEndDate || undefined,
                dateOfBirth: dateOfBirth || undefined,
                gender,
                mobileNumber,
                email,
                reportDeliveryMethod,
                status,
                updatedBy: req.user.id
            },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
        await DoctorPayment.updateMany({ doctorId: req.params.id }, { isActive: false });
        res.status(200).json({ success: true, message: "Doctor deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Hospital Management
const Lab = require("../models/Lab");

exports.getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find().populate("labs");
        res.status(200).json({ success: true, data: hospitals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addHospital = async (req, res) => {
    try {
        const { labs, ...hospitalData } = req.body;
        const payload = { ...hospitalData, createdBy: req.user.id };
        const hospital = await Hospital.create(payload);

        if (labs && Array.isArray(labs) && labs.length > 0) {
            const labDocs = labs.map(labName => ({ labName, hospital: hospital._id }));
            const createdLabs = await Lab.insertMany(labDocs);
            hospital.labs = createdLabs.map(l => l._id);
            await hospital.save();
        }

        res.status(201).json({ success: true, data: hospital });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateHospital = async (req, res) => {
    try {
        const { labs, ...hospitalData } = req.body;
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, hospitalData, { returnDocument: 'after' });

        if (labs && Array.isArray(labs)) {
            await Lab.deleteMany({ hospital: hospital._id });
            const labDocs = labs.map(labName => ({ labName, hospital: hospital._id }));
            const createdLabs = await Lab.insertMany(labDocs);
            hospital.labs = createdLabs.map(l => l._id);
            await hospital.save();
        }

        res.status(200).json({ success: true, data: hospital });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteHospital = async (req, res) => {
    try {
        await Hospital.findByIdAndDelete(req.params.id);
        await Lab.deleteMany({ hospital: req.params.id });
        res.status(200).json({ success: true, message: "Hospital deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addAdmin = async (req, res) => {
    try {
        const { name, email, mobileNumber, password, role, status } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Staff/Admin with this email already exists" });
        }

        const admin = await Admin.create({
            name,
            email,
            mobileNumber,
            password,
            role: role || "admin",
            status: status || "active"
        });

        res.status(201).json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                mobileNumber: admin.mobileNumber,
                role: admin.role,
                status: admin.status
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}, "-password");
        res.status(200).json({ success: true, data: admins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { name, email, mobileNumber, password, role, status } = req.body;
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Staff/Admin not found" });
        }
        if (name) admin.name = name;
        if (email) admin.email = email;
        if (mobileNumber !== undefined) admin.mobileNumber = mobileNumber;
        if (password) admin.password = password;
        if (role) admin.role = role;
        if (status) admin.status = status;

        await admin.save();
        const adminObj = admin.toObject();
        delete adminObj.password;

        res.status(200).json({ success: true, data: adminObj });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
        }

        await Admin.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Admin account deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
