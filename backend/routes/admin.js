const express = require("express");
const router = express.Router();
const {
    login,
    getDashboardData,
    getDoctors, addDoctor, updateDoctor, deleteDoctor,
    getEmployees, addEmployee, updateEmployee, deleteEmployee,
    getPatients, addPatient, updatePatient, deletePatient,
    getSourceTracking,
    getCommissions, payCommission,
    getHomeCollections, assignCollection,
    getRoles, addRole, updateRole, deleteRole,
    getActivityLogs,
    getNotifications, markNotificationRead,
    getBookings, updateBooking,
    getBilling, getRevenueStats,
    getDoctorPerformance, getStaffPerformance,
    getPendingReports, approveReport, rejectReport,
    getSettings, updateSettings,
    getNotes, addNote,
    getAlerts,
    getLiveDashboard,
    getHeatmap,
    getInsights,
    getPackages, addPackage, updatePackage, deletePackage,
    getTests, addTest,
    getReferralAnalytics
} = require("../controllers/admin");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public Route
router.post("/login", login);

// Protected Admin Routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", getDashboardData);

// Role Management
router.get("/roles", getRoles);
router.post("/roles", addRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

// Doctor Management
router.get("/doctors", getDoctors);
router.post("/doctors", addDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

// Employee Management
router.get("/employees", getEmployees);
router.post("/employees", addEmployee);
router.put("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);

// Activity Logs
router.get("/activity-logs", getActivityLogs);

// Notification Center
router.get("/notifications", getNotifications);
router.put("/notifications/read", markNotificationRead);

// Booking Management
router.get("/bookings", getBookings);
router.put("/bookings/:id", updateBooking);

// Billing & Revenue
router.get("/billing", getBilling);
router.get("/revenue", getRevenueStats);

// Performance Monitoring
router.get("/doctor-performance", getDoctorPerformance);
router.get("/staff-performance", getStaffPerformance);

// Report Approval
router.get("/reports/pending", getPendingReports);
router.put("/reports/approve/:id", approveReport);
router.put("/reports/reject/:id", rejectReport);

// System Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Internal Notes
router.get("/notes", getNotes);
router.post("/notes", addNote);

// Alerts
router.get("/alerts", getAlerts);

// Real-time & Insights
router.get("/live-dashboard", getLiveDashboard);
router.get("/heatmap", getHeatmap);
router.get("/insights", getInsights);

// Monitoring
router.get("/patients", getPatients);
router.post("/patients", addPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);
router.get("/source-tracking", getSourceTracking);
router.get("/referral-analytics", getReferralAnalytics);
router.get("/commission", getCommissions);
router.post("/commission/pay/:doctorId", payCommission);
router.get("/home-collection", getHomeCollections);
router.put("/home-collection/assign/:id", assignCollection);

// Packages & Membership Plans
router.get("/packages", getPackages);
router.post("/packages", addPackage);
router.put("/packages/:id", updatePackage);
router.delete("/packages/:id", deletePackage);

// Test Management (for packages)
router.get("/tests", getTests);
router.post("/tests", addTest);

module.exports = router;
