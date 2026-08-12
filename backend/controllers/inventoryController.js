const InventoryProduct = require("../models/InventoryProduct");
const InventoryBatch = require("../models/InventoryBatch");
const Supplier = require("../models/Supplier");

// ============================
// SUPPLIERS
// ============================
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, error: "Supplier not found" });
    }
    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ============================
// PRODUCTS
// ============================
exports.getProducts = async (req, res) => {
  try {
    // Simple search if query provided
    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { productCode: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const products = await InventoryProduct.find(query).sort({ createdAt: -1 });

    // We also want to compute stock for each product to send to the UI
    const productList = await Promise.all(
      products.map(async (p) => {
        const batches = await InventoryBatch.find({
          productId: p._id,
        }).populate("supplierId", "name");
        const totalStock = batches.reduce(
          (sum, b) => sum + b.availableQuantity,
          0,
        );

        // Compute status based on total stock
        let calculatedStatus = "IN STOCK";
        if (totalStock === 0) calculatedStatus = "OUT OF STOCK";
        else if (totalStock <= p.minimumStock) calculatedStatus = "LOW STOCK";
        // simple expiring logic can also be added here by checking batches
        const hasExpiring = batches.some((b) => {
          if (!b.expiryDate) return false;
          const diffTime =
            new Date(b.expiryDate).getTime() - new Date().getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= 30; // 30 days threshold
        });
        if (hasExpiring && totalStock > 0) calculatedStatus = "EXPIRING SOON";

        return {
          ...p.toObject(),
          totalStock,
          batchCount: batches.length,
          status: calculatedStatus,
          primaryBatch: batches.length > 0 ? batches[0] : null,
        };
      }),
    );

    res
      .status(200)
      .json({ success: true, count: productList.length, data: productList });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await InventoryProduct.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const batches = await InventoryBatch.find({ productId: product._id })
      .populate("supplierId", "name")
      .sort({ expiryDate: 1 });
    const totalStock = batches.reduce((sum, b) => sum + b.availableQuantity, 0);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        totalStock,
        batches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.createProductAndInitialStock = async (req, res) => {
  try {
    const {
      name,
      productCode,
      category,
      itemType,
      unit,
      description,
      minimumStock,
      reorderLevel,
      // batch fields
      supplierId,
      batchNumber,
      lotNumber,
      quantity,
      unitCost,
      purchaseDate,
      manufacturingDate,
      expiryDate,
      invoiceNumber,
      notes,
    } = req.body;

    // Check duplicate
    const existing = await InventoryProduct.findOne({ productCode });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Product code already exists" });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Initial quantity must be greater than zero",
      });
    }

    if (expiryDate && manufacturingDate) {
      if (new Date(manufacturingDate) > new Date(expiryDate)) {
        return res.status(400).json({
          success: false,
          error: "Manufacturing date cannot be after expiry date",
        });
      }
    }

    // Create Product Object
    const product = new InventoryProduct({
      name,
      productCode,
      category,
      itemType,
      unit,
      description,
      minimumStock,
      reorderLevel,
      createdBy: req.user.id,
    });

    // Create Initial Batch Object
    const batch = new InventoryBatch({
      productId: product._id,
      supplierId,
      batchNumber,
      lotNumber,
      quantity,
      availableQuantity: quantity,
      unitCost,
      purchaseDate,
      manufacturingDate,
      expiryDate,
      invoiceNumber,
      notes,
      createdBy: req.user.id,
    });

    // Validate both before saving anything
    const productValidation = product.validateSync();
    if (productValidation) throw productValidation;

    const batchValidation = batch.validateSync();
    if (batchValidation) throw batchValidation;

    // Save product
    await product.save();

    // Save batch with rollback protection
    try {
      await batch.save();
    } catch (batchError) {
      await InventoryProduct.findByIdAndDelete(product._id);
      throw batchError;
    }

    res.status(201).json({ success: true, data: { product, batch } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    req.body.updatedBy = req.user.id;
    const product = await InventoryProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await InventoryProduct.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    // Delete all associated batches first
    await InventoryBatch.deleteMany({ productId: product._id });
    // Delete the product
    await InventoryProduct.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ============================
// STOCKS & BATCHES
// ============================
exports.addStock = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await InventoryProduct.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const { quantity, manufacturingDate, expiryDate } = req.body;

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Quantity must be greater than zero" });
    }
    if (expiryDate && manufacturingDate) {
      if (new Date(manufacturingDate) > new Date(expiryDate)) {
        return res.status(400).json({
          success: false,
          error: "Manufacturing date cannot be after expiry date",
        });
      }
    }

    const batchData = {
      ...req.body,
      productId: product._id,
      availableQuantity: quantity,
      createdBy: req.user.id,
    };

    const batch = await InventoryBatch.create(batchData);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const batches = await InventoryBatch.find({ productId: req.params.id })
      .populate("supplierId", "name")
      .sort({ expiryDate: 1 });
    res
      .status(200)
      .json({ success: true, count: batches.length, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const batch = await InventoryBatch.findByIdAndUpdate(
      req.params.batchId,
      req.body,
      { new: true, runValidators: true },
    );
    if (!batch) {
      return res.status(404).json({ success: false, error: "Batch not found" });
    }
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    const batch = await InventoryBatch.findById(req.params.batchId);
    if (!batch) {
      return res.status(404).json({ success: false, error: "Batch not found" });
    }
    await InventoryBatch.findByIdAndDelete(req.params.batchId);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
