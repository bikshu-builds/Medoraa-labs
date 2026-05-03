const express = require("express");
const router = express.Router();
const hospitalController = require("../controllers/hospital");
const hospitalAuthMiddleware = require("../middleware/hospitalAuthMiddleware");

// Public routes
router.post("/login", hospitalController.login);

// Protected routes (Hospital Only)
router.use(hospitalAuthMiddleware);

router.get("/dashboard", hospitalController.getDashboardStats);
router.get("/orders", hospitalController.getOrders);
router.post("/orders", hospitalController.createOrder);
router.post("/orders/bulk", hospitalController.createBulkOrders);

router.put("/orders/receive/:id", hospitalController.receiveSample);
router.put("/orders/test-entry/:id", hospitalController.startLabEntry);
router.put("/orders/results/:id", hospitalController.saveResults);
router.put("/orders/approve/:id", hospitalController.approveOrder);
router.put("/orders/invoice-status/:id", hospitalController.updateInvoiceStatus);

const Test = require("../models/Test");
router.get("/tests", async (req, res) => {
    try {
        const tests = await Test.find();
        res.status(200).json({ success: true, data: tests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
