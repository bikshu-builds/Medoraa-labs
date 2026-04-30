const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'admin.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Imports
content = content.replace(
    'const HomeCollection = require("../models/HomeCollection");',
    'const HomeCollection = require("../models/HomeCollection");\nconst Collection = require("../models/Collection");\nconst Employee = require("../models/Staff");'
);

// 2. Update getDashboardData
content = content.replace(
    'const homeCollectionRequests = await HomeCollection.countDocuments({ status: "Scheduled" });',
    'const homeCollectionRequests = await Collection.countDocuments({ status: "Order Received" });'
);

// 3. Update getHomeCollections and Add assignCollection
const oldGetHome = `// @desc    Home Collection Tracking
exports.getHomeCollections = async (req, res) => {
    try {
        const collections = await HomeCollection.find()
            .populate("patient", "name phoneNumber")
            .populate("assignedStaff", "name employeeId");
        res.status(200).json({ success: true, data: collections });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};`;

const newGetHome = `// @desc    Home Collection Tracking (Unified)
exports.getHomeCollections = async (req, res) => {
    try {
        const collections = await Collection.find()
            .populate({
                path: "booking",
                populate: { path: "patient tests" }
            })
            .populate("assignedStaff", "name employeeId role");
        res.status(200).json({ success: true, data: collections });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Manually assign staff to collection
// @route   PUT /api/admin/home-collection/assign/:id
exports.assignCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        const collection = await Collection.findById(id);
        if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });

        const staff = await Staff.findById(staffId);
        if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

        collection.assignedStaff = staffId;
        collection.status = "Assigned";
        await collection.save();

        // Sync booking
        await Booking.findByIdAndUpdate(collection.booking, { 
            assignedStaff: staffId,
            status: "Assigned"
        });

        res.status(200).json({ success: true, message: \`Assigned to \${staff.name}\` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};`;

// Use simple string replacement for the function
content = content.replace(oldGetHome.trim(), newGetHome.trim());

fs.writeFileSync(filePath, content);
console.log('Successfully updated admin.js');
