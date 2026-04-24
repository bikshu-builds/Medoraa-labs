const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff");
const { staffMiddleware, authorizeRole } = require("../middleware/staffMiddleware");

// Public
router.post("/login", staffController.login);

// Protected
router.use(staffMiddleware);

router.get("/dashboard", staffController.getDashboard);

// Collections
router.get("/collections", authorizeRole("Sample Collection Team", "Admin Staff"), staffController.getCollections);
router.post("/update-collection", authorizeRole("Sample Collection Team", "Admin Staff"), staffController.updateCollectionStatus);

// Reception & Tracking
router.post("/sample-received", authorizeRole("Reception", "Sample Processing Team", "Admin Staff"), staffController.receiveSample);
router.post("/lab-entry", authorizeRole("Sample Processing Team", "Admin Staff"), staffController.startTesting);

// Lab Testing
router.post("/test-results", authorizeRole("Sample Processing Team", "Admin Staff"), staffController.saveResults);

// Approvals
router.get("/pending-approvals", authorizeRole("Report Approval Team", "Admin Staff"), staffController.getPendingApprovals);
router.post("/approve-report", authorizeRole("Report Approval Team", "Admin Staff"), staffController.approveResult);

// Walk-in
router.post("/walkin-registration", authorizeRole("Reception", "Admin Staff"), staffController.walkinRegistration);

// Hospital Orders
router.post("/hospital-order", authorizeRole("Reception", "Admin Staff"), staffController.createHospitalOrder);
router.get("/hospital-orders", authorizeRole("Reception", "Admin Staff", "Dispatch Team"), staffController.getHospitalOrders);

module.exports = router;
