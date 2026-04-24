const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const Employee = require("../models/Employee");
const Patient = require("../models/Patient");
const HomeCollection = require("../models/HomeCollection");
const Commission = require("../models/Commission");
const Role = require("../models/Role");
const ActivityLog = require("../models/ActivityLog");
const Notification = require("../models/Notification");
const Booking = require("../models/Booking");
const Billing = require("../models/Billing");
const ReportApproval = require("../models/ReportApproval");
const Alert = require("../models/Alert");
const Setting = require("../models/Setting");
const InternalNote = require("../models/InternalNote");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper to log activity
const logActivity = async (adminId, adminName, action, module, description, ip = "") => {
    try {
        await ActivityLog.create({
            admin: adminId,
            adminName,
            action,
            module,
            description,
            ipAddress: ip
        });
    } catch (err) {
        console.error("Activity Logging Failed:", err);
    }
};

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
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Dashboard Data
// @route   GET /api/admin/dashboard
exports.getDashboardData = async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments();
        const totalDoctors = await Doctor.countDocuments();
        const totalEmployees = await Employee.countDocuments();
        const homeCollectionRequests = await HomeCollection.countDocuments({ status: "Scheduled" });
        
        // Simple monthly revenue calculation
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        
        const monthlyRevenueData = await Patient.aggregate([
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$revenue" } } }
        ]);
        const monthlyRevenue = monthlyRevenueData[0]?.total || 0;

        const pendingReports = await Patient.countDocuments({ testStatus: "Processing" });

        // Referral Source Counts
        const sourceCounts = await Patient.aggregate([
            { $group: { _id: "$sourceType", count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalPatients,
                totalDoctors,
                totalEmployees,
                homeCollectionRequests,
                monthlyRevenue,
                pendingReports,
                sourceCounts
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Doctor Management
exports.getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json({ success: true, data: doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.create(req.body);
        await logActivity(req.user.id, req.user.name, "CREATE", "Doctors", `Added new doctor: ${doctor.name}`);
        res.status(201).json({ success: true, data: doctor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logActivity(req.user.id, req.user.name, "UPDATE", "Doctors", `Updated doctor details for: ${doctor.name}`);
        res.status(200).json({ success: true, data: doctor });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        await logActivity(req.user.id, req.user.name, "DELETE", "Doctors", `Removed doctor record: ${doctor.name}`);
        res.status(200).json({ success: true, message: "Doctor deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Employee Management
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json({ success: true, data: employees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        await logActivity(req.user.id, req.user.name, "CREATE", "Employees", `Added new employee: ${employee.name}`);
        res.status(201).json({ success: true, data: employee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logActivity(req.user.id, req.user.name, "UPDATE", "Employees", `Updated employee details for: ${employee.name}`);
        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        await logActivity(req.user.id, req.user.name, "DELETE", "Employees", `Removed employee record: ${employee.name}`);
        res.status(200).json({ success: true, message: "Employee deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Patient Monitoring
exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find().populate("doctorReferral", "name");
        res.status(200).json({ success: true, data: patients });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addPatient = async (req, res) => {
    try {
        const patient = await Patient.create(req.body);
        await logActivity(req.user.id, req.user.name, "CREATE", "Patients", `Registered new patient: ${patient.name}`);
        // Create auto notification
        await Notification.create({
            title: "New Patient Registered",
            message: `${patient.name} has been registered for clinical intake.`,
            type: "success"
        });
        res.status(201).json({ success: true, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logActivity(req.user.id, req.user.name, "UPDATE", "Patients", `Updated patient profile for: ${patient.name}`);
        res.status(200).json({ success: true, data: patient });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        await logActivity(req.user.id, req.user.name, "DELETE", "Patients", `Removed patient record: ${patient.name}`);
        res.status(200).json({ success: true, message: "Patient deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Source Tracking
exports.getSourceTracking = async (req, res) => {
    try {
        const stats = await Patient.aggregate([
            { $group: { _id: "$sourceType", count: { $sum: 1 }, revenue: { $sum: "$revenue" } } }
        ]);
        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Commission Management
exports.getCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find().populate("doctor", "name");
        res.status(200).json({ success: true, data: commissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Home Collection Tracking
exports.getHomeCollections = async (req, res) => {
    try {
        const collections = await HomeCollection.find()
            .populate("patient", "name phoneNumber")
            .populate("assignedStaff", "name employeeId");
        res.status(200).json({ success: true, data: collections });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Role Management
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json({ success: true, data: roles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        await logActivity(req.user.id, req.user.name, "CREATE", "Roles", `Created new role: ${role.name}`);
        res.status(201).json({ success: true, data: role });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logActivity(req.user.id, req.user.name, "UPDATE", "Roles", `Updated permissions for role: ${role.name}`);
        res.status(200).json({ success: true, data: role });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        await logActivity(req.user.id, req.user.name, "DELETE", "Roles", `Deleted role: ${role.name}`);
        res.status(200).json({ success: true, message: "Role deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Activity Logs
exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Notification Center
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        await Notification.updateMany({ readStatus: false }, { readStatus: true });
        res.status(200).json({ success: true, message: "Notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Booking Management
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate("assignedStaff", "name");
        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logActivity(req.user.id, req.user.name, "UPDATE", "Bookings", `Updated booking status for: ${booking.patientName}`);
        res.status(200).json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Billing & Revenue
exports.getBilling = async (req, res) => {
    try {
        const billing = await Billing.find().populate("patient", "name");
        res.status(200).json({ success: true, data: billing });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRevenueStats = async (req, res) => {
    try {
        const totalRevenue = await Billing.aggregate([{ $match: { status: "Paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
        const pendingPayments = await Billing.aggregate([{ $match: { status: "Pending" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
        
        res.status(200).json({ 
            success: true, 
            data: { 
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingPayments: pendingPayments[0]?.total || 0
            } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Performance Monitoring
exports.getDoctorPerformance = async (req, res) => {
    try {
        const performance = await Patient.aggregate([
            { $group: { _id: "$doctorReferral", patientCount: { $sum: 1 }, totalRevenue: { $sum: "$revenue" } } },
            { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "doctor" } },
            { $unwind: "$doctor" },
            { $project: { name: "$doctor.name", patientCount: 1, totalRevenue: 1 } },
            { $sort: { patientCount: -1 } }
        ]);
        res.status(200).json({ success: true, data: performance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStaffPerformance = async (req, res) => {
    try {
        const performance = await HomeCollection.aggregate([
            { $group: { _id: "$assignedStaff", visits: { $sum: 1 } } },
            { $lookup: { from: "employees", localField: "_id", foreignField: "_id", as: "staff" } },
            { $unwind: "$staff" },
            { $project: { name: "$staff.name", visits: 1 } }
        ]);
        res.status(200).json({ success: true, data: performance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Report Approval
exports.getPendingReports = async (req, res) => {
    try {
        const reports = await ReportApproval.find({ status: "Pending" });
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveReport = async (req, res) => {
    try {
        const report = await ReportApproval.findByIdAndUpdate(req.params.id, { status: "Approved" }, { new: true });
        await logActivity(req.user.id, req.user.name, "APPROVE", "Reports", `Approved report: ${report.reportId}`);
        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.rejectReport = async (req, res) => {
    try {
        const report = await ReportApproval.findByIdAndUpdate(req.params.id, { status: "Rejected", comments: req.body.comments }, { new: true });
        await logActivity(req.user.id, req.user.name, "REJECT", "Reports", `Rejected report: ${report.reportId}`);
        res.status(200).json({ success: true, data: report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    System Settings
exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne();
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await Setting.findOneAndUpdate({}, req.body, { upsert: true, new: true });
        await logActivity(req.user.id, req.user.name, "UPDATE", "Settings", "Updated system configurations");
        res.status(200).json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Internal Notes
exports.getNotes = async (req, res) => {
    try {
        const notes = await InternalNote.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addNote = async (req, res) => {
    try {
        const note = await InternalNote.create({
            ...req.body,
            createdBy: req.user.id,
            adminName: req.user.name
        });
        res.status(201).json({ success: true, data: note });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Alert System
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Live Dashboard Data
exports.getLiveDashboard = async (req, res) => {
    try {
        const activePatients = await Patient.countDocuments({ testStatus: { $ne: "Completed" } });
        const todayBookings = await Booking.countDocuments({ date: { $gte: new Date().setHours(0,0,0,0) } });
        const ongoingCollections = await HomeCollection.countDocuments({ status: "In Progress" });
        
        res.status(200).json({
            success: true,
            data: {
                activePatients,
                todayBookings,
                ongoingCollections,
                labWorkload: "Stable"
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Heatmap Data
exports.getHeatmap = async (req, res) => {
    try {
        const heatmap = await Patient.aggregate([
            { $group: { _id: { day: { $dayOfWeek: "$date" }, hour: { $hour: "$date" } }, count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, data: heatmap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    AI Insights
exports.getInsights = async (req, res) => {
    try {
        // Mocking AI insights logic for now
        res.status(200).json({
            success: true,
            data: {
                revenuePrediction: "Growth expected by 15% next month",
                efficiencyScore: 88,
                topReferralTrend: "Dr. Rajesh Kumar is increasing referrals"
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

