const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patient");
const authMiddleware = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", patientController.register);
router.post("/login", patientController.login);
router.post("/send-otp", patientController.sendOTP);
router.post("/verify-otp", patientController.verifyOTP);
router.get("/tests", patientController.getTests);

// Protected Routes
router.get("/dashboard", authMiddleware, patientController.getDashboard);
router.get("/profile", authMiddleware, patientController.getProfile);
router.put("/profile", authMiddleware, patientController.updateProfile);

router.post("/book-test", authMiddleware, patientController.bookTest);
router.get("/bookings", authMiddleware, patientController.getHistory);
router.get("/reports", authMiddleware, patientController.getReports);

router.get("/cart", authMiddleware, patientController.getCart);
router.post("/cart", authMiddleware, patientController.addToCart);
router.delete("/cart/:testId", authMiddleware, patientController.removeFromCart);

router.post("/family", authMiddleware, patientController.addFamilyMember);
router.post("/address", authMiddleware, patientController.addAddress);
router.post("/support", authMiddleware, patientController.submitSupport);

module.exports = router;
