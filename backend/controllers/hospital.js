const Hospital = require("../models/Hospital");
const HospitalOrder = require("../models/HospitalOrder");
const Test = require("../models/Test");
const jwt = require("jsonwebtoken");

// @desc    Hospital Login
// @route   POST /api/hospital/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Search by either email or loginUsername
        const hospital = await Hospital.findOne({
            $or: [{ email: email }, { loginUsername: email }]
        });

        if (!hospital || !(await hospital.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email/username or password" });
        }

        if (hospital.status !== "Active") {
            return res.status(401).json({ success: false, message: "Account is inactive. Please contact the administrator." });
        }

        const token = jwt.sign(
            { id: hospital._id, role: "hospital" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            hospital: {
                id: hospital._id,
                name: hospital.name,
                branchName: hospital.branchName,
                email: hospital.email,
                hospitalCode: hospital.hospitalCode
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/hospital/dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const hospitalId = req.user.id;

        const totalOrders = await HospitalOrder.countDocuments({ hospitalId });
        const pendingReports = await HospitalOrder.countDocuments({ hospitalId, status: { $ne: "Report Ready" } });
        const completedReports = await HospitalOrder.countDocuments({ hospitalId, status: "Report Ready" });

        const billingRecords = await HospitalOrder.find({ hospitalId });
        let totalRevenue = 0;
        let pendingBilling = 0;

        billingRecords.forEach(order => {
            totalRevenue += order.invoiceAmount || 0;
            if (order.invoiceStatus === "Unpaid") {
                pendingBilling += order.invoiceAmount || 0;
            }
        });

        const recentRequests = await HospitalOrder.find({ hospitalId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("tests", "name");

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                pendingReports,
                completedReports,
                pendingBilling,
                monthlyRevenue: totalRevenue,
                recentRequests
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all hospital orders for this hospital
// @route   GET /api/hospital/orders
exports.getOrders = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const orders = await HospitalOrder.find({ hospitalId })
            .sort({ createdAt: -1 })
            .populate("tests", "name price category");
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create a new hospital patient request
// @route   POST /api/hospital/orders
exports.createOrder = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital account not found" });
        }

        const bookingId = "HOSP-" + Date.now().toString(36).toUpperCase();

        // Compute total amount based on the tests selected
        let invoiceAmount = 0;
        if (req.body.tests && req.body.tests.length > 0) {
            const testDocs = await Test.find({ _id: { $in: req.body.tests } });
            invoiceAmount = testDocs.reduce((acc, t) => acc + (t.price || 0), 0);
        }

        const newOrder = await HospitalOrder.create({
            ...req.body,
            hospitalId,
            hospitalName: hospital.name,
            bookingId,
            invoiceAmount,
            invoiceStatus: "Unpaid",
            status: "Pending",
            orderDate: new Date()
        });

        res.status(201).json({ success: true, data: newOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Bulk Upload requests from Excel patient list
// @route   POST /api/hospital/orders/bulk
exports.createBulkOrders = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const hospital = await Hospital.findById(hospitalId);

        if (!hospital) {
            return res.status(404).json({ success: false, message: "Hospital account not found" });
        }

        const { patients } = req.body;
        if (!patients || !Array.isArray(patients)) {
            return res.status(400).json({ success: false, message: "A list of patients is required" });
        }

        const createdOrders = [];
        for (const p of patients) {
            let invoiceAmount = 0;
            if (p.tests && p.tests.length > 0) {
                const testDocs = await Test.find({ _id: { $in: p.tests } });
                invoiceAmount = testDocs.reduce((acc, t) => acc + (t.price || 0), 0);
            }

            const bookingId = "HOSP-" + Date.now().toString(36).toUpperCase() + Math.floor(100 + Math.random() * 900);
            const order = await HospitalOrder.create({
                hospitalId,
                hospitalName: hospital.name,
                patientName: p.patientName,
                patientAge: p.patientAge,
                patientGender: p.patientGender,
                patientPhone: p.patientPhone,
                doctorName: p.doctorName || "Self / Referring",
                tests: p.tests || [],
                priority: p.priority || "Normal",
                collectionType: p.collectionType || "Walk-in",
                bookingId,
                invoiceAmount,
                invoiceStatus: "Unpaid",
                status: "Pending",
                orderDate: new Date()
            });

            createdOrders.push(order);
        }

        res.status(201).json({ success: true, data: createdOrders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Sample Reception Tracking
// @route   PUT /api/hospital/orders/receive/:id
exports.receiveSample = async (req, res) => {
    try {
        const { id } = req.params;
        const { labLocation, sampleReceivedBy } = req.body;

        const order = await HospitalOrder.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.status = "Sample Collected";
        order.sampleReceivedAt = new Date();
        order.labLocation = labLocation || "Main Lab Hub";
        order.sampleReceivedBy = sampleReceivedBy || "Receptionist";
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Lab Entry Workflow (In Testing)
// @route   PUT /api/hospital/orders/test-entry/:id
exports.startLabEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { labTechnician, workstation } = req.body;

        const order = await HospitalOrder.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.status = "Processing";
        order.inTestingAt = new Date();
        order.labTechnician = labTechnician || "Technician";
        order.workstation = workstation || "Hematology Workbench";
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Submit Results / Parameters for the order
// @route   PUT /api/hospital/orders/results/:id
exports.saveResults = async (req, res) => {
    try {
        const { id } = req.params;
        const { testResults, microscopeImages, diagnosticAttachments } = req.body;

        const order = await HospitalOrder.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.testResults = testResults || [];
        if (microscopeImages) order.microscopeImages = microscopeImages;
        if (diagnosticAttachments) order.diagnosticAttachments = diagnosticAttachments;
        order.approvalStatus = "Technician Reviewed";
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Pathologist Approval Layer Workflow
// @route   PUT /api/hospital/orders/approve/:id
exports.approveOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus, approvalComments, approvedBy } = req.body;

        const order = await HospitalOrder.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.approvalStatus = approvalStatus;
        order.approvalComments = approvalComments;
        order.approvedBy = approvedBy || "Senior Pathologist";
        order.approvedAt = new Date();

        if (approvalStatus === "Final Approval") {
            order.status = "Report Ready";
            // Set version tracking
            if (order.pdfUrl) {
                order.versionHistory.push({
                    pdfUrl: order.pdfUrl,
                    updatedAt: new Date(),
                    updatedBy: approvedBy
                });
                order.reportVersion += 1;
            }
            order.pdfUrl = `/api/hospital/orders/pdf/${order._id}`;
        } else if (approvalStatus === "Rejected") {
            order.status = "Pending";
        }

        await order.save();
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update billing status
// @route   PUT /api/hospital/orders/invoice-status/:id
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { invoiceStatus } = req.body;

        const order = await HospitalOrder.findById(id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.invoiceStatus = invoiceStatus || "Paid";
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
