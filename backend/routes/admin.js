const express = require("express");
const router = express.Router();
const {
    login,
    getDashboardData,
    getDoctors, addDoctor, updateDoctor, deleteDoctor,
    getHospitals, addHospital, updateHospital, deleteHospital,
    addAdmin,
    getAdmins,
    updateAdmin,
    deleteAdmin
} = require("../controllers/admin");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public Route
router.post("/login", login);

// Protected Admin Routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", getDashboardData);

// Admin Account Management
router.get("/admins", getAdmins);
router.post("/admins", addAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

// Doctor Management
router.get("/doctors", getDoctors);
router.post("/doctors", addDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

// Hospital Management
router.get("/hospitals", getHospitals);
router.post("/hospitals", addHospital);
router.put("/hospitals/:id", updateHospital);
router.delete("/hospitals/:id", deleteHospital);

module.exports = router;
