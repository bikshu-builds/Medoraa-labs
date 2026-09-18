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
    getNextRegistrationNumber,
    updateRegistrationTests,
    updateRegistrationAuthorization,
    transferRegistrationSample,
    downloadReportPDF,
    downloadTransferLabelPDF,
    downloadReceiptPDF,
    downloadReceiptHTML
} = require("../controllers/registration");

// Samples Directory Routes
const {
    getSamples,
    addSample,
    updateSample,
    deleteSample,
    deleteAllSamples,
    importSamples
} = require("../controllers/sample");
const {
    getSettings,
    uploadQrCode,
    deleteQrCode
} = require("../controllers/settings");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public Route
router.post("/login", login);

// Direct PDF Endpoints (accessible for browser print & mobile view)
router.get("/registrations/:id/pdf", downloadReportPDF);
router.get("/registrations/:id/transfer-label-pdf", downloadTransferLabelPDF);
router.get("/registrations/:id/receipt-pdf", downloadReceiptPDF);
router.get("/registrations/:id/receipt-html", downloadReceiptHTML);


// Protected Staff Routes (accessible by any logged in staff role)
router.use(authMiddleware);

router.get("/dashboard", getDashboardData);
router.get("/doctors", getDoctors);
router.get("/hospitals", getHospitals);
router.get("/admins", getAdmins);

// Registration Desk Routes
router.get("/registrations/next-id", getNextRegistrationNumber);
router.post("/registrations", addRegistration);
router.get("/registrations", getRegistrations);
router.put("/registrations/:id/tests", updateRegistrationTests);
router.put("/registrations/:id/authorization", updateRegistrationAuthorization);
router.put("/registrations/:id/transfer-sample", transferRegistrationSample);

// Samples Directory Routes
router.get("/samples", getSamples);
router.post("/samples", addSample);
router.put("/samples/:id", updateSample);
router.delete("/samples", deleteAllSamples);
router.delete("/samples/:id", deleteSample);
router.post("/samples/import", importSamples);

// Settings & Configuration Routes
router.get("/settings", getSettings);

// Admin-only Mutation Routes
router.use(adminMiddleware);

// Settings Mutations
router.post("/settings/qr-code", uploadQrCode);
router.delete("/settings/qr-code", deleteQrCode);

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
