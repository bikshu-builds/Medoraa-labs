const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff");
const { staffMiddleware, authorizeRole } = require("../middleware/staffMiddleware");

// Public
router.post("/login", staffController.login);

// Protected
router.use(staffMiddleware);

// Doctors
router.get("/doctors", staffController.getDoctors);

router.get("/dashboard", staffController.getDashboard);
router.post("/update-location", staffController.updateLiveLocation);

// Collections
router.get("/collections", authorizeRole("Sample Collection Team", "Admin Staff"), staffController.getCollections);
router.post("/claim-collection", authorizeRole("Sample Collection Team", "Admin Staff"), staffController.claimCollection);
router.post("/update-collection", authorizeRole("Sample Collection Team", "Admin Staff"), staffController.updateCollectionStatus);
router.post("/visit-log", authorizeRole("Sample Collection Team", "Admin Staff"), staffController.saveVisitLog);

// Reception & Tracking
router.get("/received-samples", authorizeRole("Reception", "Sample Processing Team", "Admin Staff", "Sample Collection Team", "Report Approval Team"), staffController.getReceivedSamples);
router.post("/sample-received", authorizeRole("Reception", "Sample Processing Team", "Admin Staff", "Sample Collection Team", "Report Approval Team"), staffController.receiveSample);
router.post("/lab-entry", authorizeRole("Sample Processing Team", "Admin Staff", "Sample Collection Team"), staffController.startTesting);

// Lab Testing
router.post("/test-results", authorizeRole("Sample Processing Team", "Admin Staff", "Sample Collection Team"), staffController.saveResults);

// Approvals
router.get("/pending-approvals", authorizeRole("Report Approval Team", "Admin Staff", "Sample Collection Team"), staffController.getPendingApprovals);
router.post("/approve-report", authorizeRole("Report Approval Team", "Admin Staff", "Sample Collection Team"), staffController.approveResult);

// Walk-in
router.get("/walkins", staffController.getWalkins);
router.get("/booking-details/:id", staffController.getBookingDetails);
router.post("/walkin-registration", authorizeRole("Reception", "Admin Staff", "Sample Collection Team"), staffController.walkinRegistration);

// Hospital Orders
router.post("/hospital-order", authorizeRole("Reception", "Admin Staff", "Sample Collection Team"), staffController.createHospitalOrder);
router.get("/hospital-orders", authorizeRole("Reception", "Admin Staff", "Dispatch Team", "Sample Collection Team"), staffController.getHospitalOrders);
router.get("/reports", authorizeRole("Reception", "Admin Staff", "Dispatch Team", "Sample Collection Team", "Report Approval Team"), staffController.getReports);
router.get("/billing", authorizeRole("Reception", "Admin Staff", "Sample Collection Team"), staffController.getBilling);
router.get("/lookup/:query", staffController.lookup);

module.exports = router;
