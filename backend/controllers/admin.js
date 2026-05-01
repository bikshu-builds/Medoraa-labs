const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const Staff = require("../models/Staff");
const Patient = require("../models/Patient");
const HomeCollection = require("../models/HomeCollection");
const Collection = require("../models/Collection");
const Employee = require("../models/Staff");
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
const Package = require("../models/Package");
const Test = require("../models/Test");
const Hospital = require("../models/Hospital");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper to log activity
const logActivity = async (adminId, adminName, action, module, description, ip = "") => {
    try {
        await ActivityLog.create({
            admin: adminId,
            adminName: adminName || "Admin",
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
            { id: admin._id, role: "admin", roleId: admin.role },
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
        const homeCollectionRequests = await Collection.countDocuments({ status: "Order Received" });
        
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
        const employees = await Staff.find();
        res.status(200).json({ success: true, data: employees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addEmployee = async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        const employee = await Staff.create(req.body);
        await logActivity(req.user.id, req.user.name || "Admin", "CREATE", "Employees", `Added new employee: ${employee.name}`);
        res.status(201).json({ success: true, data: employee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        // Prevent password from being overwritten if empty
        if (!req.body.password || req.body.password === "") {
            delete req.body.password;
        } else {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        
        const employee = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await logActivity(req.user.id, req.user.name || "Admin", "UPDATE", "Employees", `Updated employee details for: ${employee.name}`);
        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Staff.findByIdAndDelete(req.params.id);
        await logActivity(req.user.id, req.user.name || "Admin", "DELETE", "Employees", `Removed employee record: ${employee.name}`);
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
        if (!req.body.doctorReferral) {
            delete req.body.doctorReferral;
        }
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
        if (req.body.doctorReferral === "") {
            req.body.doctorReferral = null; // or unset
        }
        if (!req.body.doctorReferral && req.body.doctorReferral !== null) {
            delete req.body.doctorReferral;
        }
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        const immutableFields = ["_id", "patientId", "createdAt", "updatedAt", "__v"];
        Object.keys(req.body).forEach(key => {
            if (immutableFields.includes(key)) return;
            if (key === "password" && !req.body[key]) return;
            patient[key] = req.body[key];
        });

        await patient.save();

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
        const savedCommissions = await Commission.find().populate("doctor", "name");

        const patientsByDoctor = await Patient.aggregate([
            { $match: { doctorReferral: { $exists: true, $ne: null, $ne: "" } } },
            { $group: { 
                _id: "$doctorReferral", 
                patientCount: { $sum: 1 }, 
                totalRevenue: { $sum: "$revenue" } 
            }}
        ]);

        const populatedCommissions = [];
        const currentMonth = new Date().toISOString().slice(0, 7);

        for (const item of patientsByDoctor) {
            const doctor = await Doctor.findById(item._id);
            if (doctor) {
                const commissionPercentage = doctor.commissionPercentage || 10;
                const totalCommission = (item.totalRevenue * commissionPercentage) / 100;
                
                const existing = savedCommissions.find(c => c.doctor && c.doctor._id.toString() === doctor._id.toString() && c.month === currentMonth);

                if (existing) {
                    populatedCommissions.push({
                        _id: existing._id,
                        doctor: { _id: doctor._id, name: doctor.name },
                        patientCount: existing.patientCount,
                        commissionPercentage: existing.commissionPercentage,
                        totalCommission: existing.totalCommission,
                        month: existing.month,
                        status: existing.status
                    });
                } else {
                    populatedCommissions.push({
                        _id: doctor._id,
                        doctor: { _id: doctor._id, name: doctor.name },
                        patientCount: item.patientCount,
                        commissionPercentage: commissionPercentage,
                        totalCommission: totalCommission,
                        month: currentMonth,
                        status: "Unpaid"
                    });
                }
            }
        }
        
        for (const saved of savedCommissions) {
            const alreadyAdded = populatedCommissions.find(p => p.doctor && p.doctor._id.toString() === saved.doctor._id.toString() && p.month === saved.month);
            if (!alreadyAdded) {
                populatedCommissions.push(saved);
            }
        }

        res.status(200).json({ success: true, data: populatedCommissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.payCommission = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const { month, totalCommission, patientCount, commissionPercentage } = req.body;

        let commission = await Commission.findOne({ doctor: doctorId, month: month });
        if (commission) {
            commission.status = "Paid";
            commission.totalCommission = totalCommission;
            commission.patientCount = patientCount;
            await commission.save();
        } else {
            commission = await Commission.create({
                doctor: doctorId,
                patientCount: patientCount,
                commissionPercentage: commissionPercentage,
                totalCommission: totalCommission,
                month: month,
                status: "Paid"
            });
        }
        await logActivity(req.user.id, req.user.name, "UPDATE", "Commissions", `Marked commission for ${month} as Paid.`);
        res.status(200).json({ success: true, data: commission });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Home Collection Tracking
// @desc    Home Collection Tracking (Unified)
exports.getHomeCollections = async (req, res) => {
    try {
        const collections = await Collection.find()
            .populate({
                path: "booking",
                populate: { path: "patient tests" }
            })
            .populate("assignedStaff", "name employeeId role");
        res.status(200).json({ success: true, data: collections });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Manually assign staff to collection
// @route   PUT /api/admin/home-collection/assign/:id
exports.assignCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        const collection = await Collection.findById(id);
        if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });

        const staff = await Staff.findById(staffId);
        if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

        collection.assignedStaff = staffId;
        collection.status = "Assigned";
        await collection.save();

        // Sync booking
        await Booking.findByIdAndUpdate(collection.booking, { 
            assignedStaff: staffId,
            status: "Assigned"
        });

        res.status(200).json({ success: true, message: `Assigned to ${staff.name}` });
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
        const bookings = await Booking.find().populate("patient", "name");
        const patients = await Patient.find({ revenue: { $gt: 0 } });

        const billingRecords = [];

        for (const b of bookings) {
            let status = b.paymentStatus || "Pending";
            if (status === "Pending") status = "Unpaid";

            billingRecords.push({
                _id: b._id,
                patientName: b.patientName || (b.patient ? b.patient.name : "Unknown"),
                testName: b.sourceType || "Walk-in",
                totalAmount: b.totalAmount,
                paymentMethod: "CASH", 
                status: status,
                paymentDate: b.createdAt
            });
        }

        for (const p of patients) {
            billingRecords.push({
                _id: p._id,
                patientName: p.name,
                testName: p.sourceType || "Direct Registry",
                totalAmount: p.revenue,
                paymentMethod: "CASH",
                status: "Paid",
                paymentDate: p.date || p.createdAt
            });
        }

        // Sort ascending to generate sequential invoice IDs by date
        billingRecords.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

        billingRecords.forEach((record, index) => {
            const year = new Date(record.paymentDate).getFullYear() || new Date().getFullYear();
            record.invoiceId = `INV-${year}-${String(index + 1).padStart(4, '0')}`;
        });

        // Re-sort descending for the dashboard display
        billingRecords.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        res.status(200).json({ success: true, data: billingRecords });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRevenueStats = async (req, res) => {
    try {
        const patientRevSource = await Patient.aggregate([{ $group: { _id: "$sourceType", total: { $sum: "$revenue" } } }]);
        const bookingRevSource = await Booking.aggregate([{ $match: { paymentStatus: "Paid" } }, { $group: { _id: "$sourceType", total: { $sum: "$totalAmount" } } }]);
        
        const sources = ["Walk-in", "Referring Doctor", "Home Collection"];
        const bySource = {
            "Walk-in": 0,
            "Referring Doctor": 0,
            "Home Collection": 0
        };

        [...patientRevSource, ...bookingRevSource].forEach(item => {
            const type = item._id || "Walk-in";
            if (bySource[type] !== undefined) {
                bySource[type] += item.total;
            } else {
                bySource[type] = item.total;
            }
        });

        const totalRevenue = Object.values(bySource).reduce((a, b) => a + b, 0);

        res.status(200).json({ 
            success: true, 
            data: { 
                bySource,
                totalRevenue
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

// @desc    Package Management
exports.getPackages = async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json({ success: true, data: packages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addPackage = async (req, res) => {
    try {
        const newPackage = await Package.create(req.body);
        await logActivity(req.user.id, req.user.name, "CREATE", "Packages", `Created package: ${newPackage.name}`);
        res.status(201).json({ success: true, data: newPackage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePackage = async (req, res) => {
    try {
        const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPackage) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }
        await logActivity(req.user.id, req.user.name, "UPDATE", "Packages", `Updated package: ${updatedPackage.name}`);
        res.status(200).json({ success: true, data: updatedPackage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deletePackage = async (req, res) => {
    try {
        const deletedPackage = await Package.findByIdAndDelete(req.params.id);
        if (!deletedPackage) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }
        await logActivity(req.user.id, req.user.name, "DELETE", "Packages", `Deleted package: ${deletedPackage.name}`);
        res.status(200).json({ success: true, message: "Package deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Test Management
exports.getTests = async (req, res) => {
    try {
        const tests = await Test.find();
        res.status(200).json({ success: true, data: tests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addTest = async (req, res) => {
    try {
        const newTest = await Test.create(req.body);
        await logActivity(req.user.id, req.user.name, "CREATE", "Tests", `Created test: ${newTest.name}`);
        res.status(201).json({ success: true, data: newTest });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getReferralAnalytics = async (req, res) => {
    try {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        // 1. Source Distribution
        const sourceDistribution = await Booking.aggregate([
            { $match: { createdAt: { $gte: last30Days } } },
            { $group: { 
                _id: "$sourceType", 
                count: { $sum: 1 }, 
                revenue: { $sum: "$totalAmount" } 
            }},
            { $sort: { count: -1 } }
        ]);

        // 2. Doctor Referral Performance
        const doctorPerformance = await Booking.aggregate([
            { $match: { 
                doctorReferral: { $exists: true, $ne: null },
                createdAt: { $gte: last30Days }
            }},
            { $group: { 
                _id: "$doctorReferral", 
                patientCount: { $sum: 1 }, 
                revenue: { $sum: "$totalAmount" } 
            }},
            { $lookup: { 
                from: "doctors", 
                localField: "_id", 
                foreignField: "_id", 
                as: "doctor" 
            }},
            { $unwind: "$doctor" },
            { $project: { 
                name: "$doctor.name", 
                specialty: "$doctor.specialty",
                hospital: "$doctor.hospitalName",
                patientCount: 1, 
                revenue: 1 
            }},
            { $sort: { patientCount: -1 } }
        ]);

        // 3. Corporate / Camp Analytics
        const corporateAnalytics = await Patient.aggregate([
            { $match: { 
                sourceType: "Corporate / Camps",
                "corporateDetails.corporateName": { $exists: true, $ne: "" }
            }},
            { $group: { 
                _id: "$corporateDetails.corporateName", 
                count: { $sum: 1 },
                camps: { $addToSet: "$corporateDetails.campName" }
            }},
            { $project: {
                corporateName: "$_id",
                count: 1,
                campCount: { $size: "$camps" }
            }},
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                period: "Last 30 Days",
                sourceDistribution,
                doctorPerformance,
                corporateAnalytics
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Admin: Get all hospitals
exports.getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: hospitals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Admin: Create hospital account
exports.addHospital = async (req, res) => {
    try {
        const hospital = await Hospital.create(req.body);
        await logActivity(req.user.id, req.user.name, "CREATE", "Hospitals", `Added new hospital: ${hospital.name}`);
        res.status(201).json({ success: true, data: hospital });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Admin: Update hospital account
exports.updateHospital = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await Hospital.findById(id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found" });
        }

        // Prevent password overwrite if empty
        if (!req.body.password || req.body.password === "") {
            delete req.body.password;
        }

        Object.keys(req.body).forEach(key => {
            hospital[key] = req.body[key];
        });

        await hospital.save();

        await logActivity(req.user.id, req.user.name, "UPDATE", "Hospitals", `Updated hospital details for: ${hospital.name}`);
        res.status(200).json({ success: true, data: hospital });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Admin: Delete hospital account
exports.deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await Hospital.findByIdAndDelete(id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital not found" });
        }
        await logActivity(req.user.id, req.user.name, "DELETE", "Hospitals", `Removed hospital: ${hospital.name}`);
        res.status(200).json({ success: true, message: "Hospital deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

