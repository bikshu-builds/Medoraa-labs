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
const {
    addRegistration,
    getRegistrations,
    updateRegistrationTests
} = require("../controllers/registration");
const {
    getSamples,
    addSample,
    updateSample,
    deleteSample,
    importSamples
} = require("../controllers/sample");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public Route
router.post("/login", login);

// Protected Staff Routes (accessible by any logged in staff role)
router.use(authMiddleware);

router.get("/dashboard", getDashboardData);
router.get("/doctors", getDoctors);
router.get("/hospitals", getHospitals);
router.get("/admins", getAdmins);

// Registration Desk Routes
router.post("/registrations", addRegistration);
router.get("/registrations", getRegistrations);
router.put("/registrations/:id/tests", updateRegistrationTests);

// Samples Directory Routes
router.get("/samples", getSamples);
router.post("/samples", addSample);
router.put("/samples/:id", updateSample);
router.delete("/samples/:id", deleteSample);
router.post("/samples/import", importSamples);

// Admin-only Mutation Routes
router.use(adminMiddleware);

// Admin Account Management Mutations
router.post("/admins", addAdmin);
router.put("/admins/:id", updateAdmin);
router.delete("/admins/:id", deleteAdmin);

// Doctor Management Mutations
router.post("/doctors", addDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

// Hospital Management Mutations
router.post("/hospitals", addHospital);
router.put("/hospitals/:id", updateHospital);
router.delete("/hospitals/:id", deleteHospital);

module.exports = router;
