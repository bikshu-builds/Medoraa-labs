const Sample = require("../models/Sample");

// Helper to replace empty value/space with "-"
const cleanValue = (val) => {
    if (val === null || val === undefined) return "-";
    const strVal = String(val).trim();
    return strVal === "" ? "-" : strVal;
};

// @desc    Get all samples
// @route   GET /api/admin/samples
exports.getSamples = async (req, res) => {
    try {
        const samples = await Sample.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email");
        res.status(200).json({ success: true, data: samples });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add a single sample manually
// @route   POST /api/admin/samples
exports.addSample = async (req, res) => {
    try {
        const {
            slno,
            organ,
            category,
            testName,
            method,
            container,
            sampleUsedForTest,
            reportTime,
            referenceRange,
            labPrice,
            patientPrice
        } = req.body;

        if (!testName || String(testName).trim() === "") {
            return res.status(400).json({ success: false, message: "Test Name is required" });
        }

        const sample = await Sample.create({
            slno: cleanValue(slno),
            organ: cleanValue(organ),
            category: cleanValue(category),
            testName: cleanValue(testName),
            method: cleanValue(method),
            container: cleanValue(container),
            sampleUsedForTest: cleanValue(sampleUsedForTest),
            reportTime: cleanValue(reportTime),
            referenceRange: cleanValue(referenceRange),
            labPrice: cleanValue(labPrice),
            patientPrice: cleanValue(patientPrice),
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: sample });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update a sample
// @route   PUT /api/admin/samples/:id
exports.updateSample = async (req, res) => {
    try {
        const {
            slno,
            organ,
            category,
            testName,
            method,
            container,
            sampleUsedForTest,
            reportTime,
            referenceRange,
            labPrice,
            patientPrice
        } = req.body;

        if (testName !== undefined && String(testName).trim() === "") {
            return res.status(400).json({ success: false, message: "Test Name cannot be empty" });
        }

        const updateData = {};
        if (slno !== undefined) updateData.slno = cleanValue(slno);
        if (organ !== undefined) updateData.organ = cleanValue(organ);
        if (category !== undefined) updateData.category = cleanValue(category);
        if (testName !== undefined) updateData.testName = cleanValue(testName);
        if (method !== undefined) updateData.method = cleanValue(method);
        if (container !== undefined) updateData.container = cleanValue(container);
        if (sampleUsedForTest !== undefined) updateData.sampleUsedForTest = cleanValue(sampleUsedForTest);
        if (reportTime !== undefined) updateData.reportTime = cleanValue(reportTime);
        if (referenceRange !== undefined) updateData.referenceRange = cleanValue(referenceRange);
        if (labPrice !== undefined) updateData.labPrice = cleanValue(labPrice);
        if (patientPrice !== undefined) updateData.patientPrice = cleanValue(patientPrice);

        const sample = await Sample.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after' }
        );

        if (!sample) {
            return res.status(404).json({ success: false, message: "Sample not found" });
        }

        res.status(200).json({ success: true, data: sample });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a sample
// @route   DELETE /api/admin/samples/:id
exports.deleteSample = async (req, res) => {
    try {
        const sample = await Sample.findByIdAndDelete(req.params.id);
        if (!sample) {
            return res.status(404).json({ success: false, message: "Sample not found" });
        }
        res.status(200).json({ success: true, message: "Sample deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Import samples from Excel JSON representation
// @route   POST /api/admin/samples/import
exports.importSamples = async (req, res) => {
    try {
        const { samples } = req.body;

        if (!samples || !Array.isArray(samples)) {
            return res.status(400).json({ success: false, message: "Invalid samples payload. Expected array." });
        }

        const preparedSamples = [];
        for (const item of samples) {
            // Check that the item has at least a test name or some key field, or else ignore empty rows
            const testName = item["Test Name"] || item.testName;
            if (!testName || String(testName).trim() === "") {
                continue;
            }

            preparedSamples.push({
                slno: cleanValue(item["Sl No"] || item.slno || item["slno"] || item["S.No"] || item["sno"]),
                organ: cleanValue(item["Organ"] || item.organ),
                category: cleanValue(item["Category"] || item.category),
                testName: cleanValue(testName),
                method: cleanValue(item["Method"] || item.method),
                container: cleanValue(item["Container"] || item.container),
                sampleUsedForTest: cleanValue(item["Sample Used for test"] || item.sampleUsedForTest || item["sampleUsedForTest"] || item["Sample Used"] || item["SampleUsed"]),
                reportTime: cleanValue(item["Report Time"] || item.reportTime || item["reportTime"] || item["ReportTime"]),
                referenceRange: cleanValue(item["Reference Range"] || item.referenceRange || item["referenceRange"] || item["ReferenceRange"]),
                labPrice: cleanValue(item["Lab Price"] || item.labPrice || item["labPrice"] || item["LabPrice"]),
                patientPrice: cleanValue(item["Patient Price"] || item.patientPrice || item["patientPrice"] || item["PatientPrice"]),
                createdBy: req.user.id
            });
        }

        if (preparedSamples.length === 0) {
            return res.status(400).json({ success: false, message: "No valid samples found in the import payload" });
        }

        const insertedDocs = await Sample.insertMany(preparedSamples);

        res.status(201).json({
            success: true,
            message: `Successfully imported ${insertedDocs.length} samples`,
            count: insertedDocs.length
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
