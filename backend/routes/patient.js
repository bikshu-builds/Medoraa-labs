const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient");
const authMiddleware = require("../middleware/authMiddleware");

// Public Routes
router.post("/identify", patientController.identify);
router.post("/register", patientController.register);
router.post("/login", patientController.login);
router.get("/tests", patientController.getTests);
router.get("/suggestions", authMiddleware, patientController.getSuggestions);

// Protected Routes
router.get("/dashboard", authMiddleware, patientController.getDashboard);
router.get("/profile", authMiddleware, patientController.getProfile);
router.put("/profile", authMiddleware, patientController.updateProfile);

router.post("/book-test", authMiddleware, patientController.bookTest);
router.get("/bookings", authMiddleware, patientController.getHistory);
router.get("/reports", authMiddleware, patientController.getReports);
router.get("/billing", authMiddleware, patientController.getBilling);
router.get("/notifications", authMiddleware, patientController.getNotifications);
router.delete("/notifications/:id", authMiddleware, patientController.deleteNotification);
router.put("/notifications/mark-all-read", authMiddleware, patientController.markAllNotificationsRead);

router.get("/cart", authMiddleware, patientController.getCart);
router.post("/cart", authMiddleware, patientController.addToCart);
router.delete("/cart/:testId", authMiddleware, patientController.removeFromCart);

router.post("/family", authMiddleware, patientController.addFamilyMember);
router.post("/address", authMiddleware, patientController.addAddress);
router.delete("/address/:id", authMiddleware, patientController.deleteAddress);
router.post("/support", authMiddleware, patientController.submitSupport);

module.exports = router;
