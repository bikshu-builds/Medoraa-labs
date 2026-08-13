const TestConsumableMapping = require("../models/TestConsumableMapping");

// @desc    Get all mappings
// @route   GET /api/admin/inventory/mappings
exports.getMappings = async (req, res) => {
  try {
    const mappings = await TestConsumableMapping.find()
      .populate("testId", "testName")
      .populate("inventoryProductId", "name unit")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: mappings.length, data: mappings });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Create a mapping
// @route   POST /api/admin/inventory/mappings
exports.createMapping = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    // Check if exact mapping already exists
    const existing = await TestConsumableMapping.findOne({
      testId: req.body.testId,
      inventoryProductId: req.body.inventoryProductId,
    });

    if (existing) {
      if (!existing.isActive && req.body.isActive) {
        existing.isActive = true;
        existing.quantity = req.body.quantity;
        existing.unit = req.body.unit;
        existing.updatedBy = req.user.id;
        await existing.save();
        return res.status(200).json({ success: true, data: existing });
      }
      return res
        .status(400)
        .json({
          success: false,
          error: "Mapping already exists for this test and product combination",
        });
    }

    const mapping = await TestConsumableMapping.create(req.body);
    const populated = await TestConsumableMapping.findById(mapping._id)
      .populate("testId", "testName")
      .populate("inventoryProductId", "name unit");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update a mapping
// @route   PUT /api/admin/inventory/mappings/:id
exports.updateMapping = async (req, res) => {
  try {
    req.body.updatedBy = req.user.id;
    const mapping = await TestConsumableMapping.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("testId", "testName")
      .populate("inventoryProductId", "name unit");

    if (!mapping) {
      return res
        .status(404)
        .json({ success: false, error: "Mapping not found" });
    }

    res.status(200).json({ success: true, data: mapping });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete (or logically delete) a mapping
// @route   DELETE /api/admin/inventory/mappings/:id
exports.deleteMapping = async (req, res) => {
  try {
    // We will hard delete it to avoid db bloat, or we can just set isActive = false
    const mapping = await TestConsumableMapping.findById(req.params.id);
    if (!mapping) {
      return res
        .status(404)
        .json({ success: false, error: "Mapping not found" });
    }

    await TestConsumableMapping.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
