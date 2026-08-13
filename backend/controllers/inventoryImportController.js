const ExcelJS = require("exceljs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const InventoryProduct = require("../models/InventoryProduct");
const InventoryBatch = require("../models/InventoryBatch");
const Supplier = require("../models/Supplier");
const InventoryImportBatch = require("../models/InventoryImportBatch");
const InventoryImportRow = require("../models/InventoryImportRow");

// Multer Config
const storage = multer.memoryStorage();
exports.uploadExcel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.originalname.endsWith(".xlsx")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx files are allowed!"), false);
    }
  },
});

const DEFAULT_CATEGORIES = [
  "Consumables",
  "Reagents",
  "Equipment",
  "Office Supplies",
  "Medical Supplies",
  "Other",
];

const ITEM_TYPES = ["Consumable", "Reagent", "Equipment", "Asset", "Other"];

// @desc    Download Inventory Import Template
// @route   GET /api/admin/inventory/template
exports.downloadTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Medoraa Labs";
    workbook.created = new Date();

    const txSheet = workbook.addWorksheet("Inventory_Import");

    txSheet.columns = [
      { key: "productCode", width: 20 },
      { key: "name", width: 35 },
      { key: "category", width: 25 },
      { key: "itemType", width: 15 },
      { key: "unit", width: 15 },
      { key: "minimumStock", width: 15 },
      { key: "reorderLevel", width: 15 },
      { key: "supplierName", width: 30 },
      { key: "batchNumber", width: 25 },
      { key: "quantity", width: 15 },
      { key: "unitCost", width: 15 },
      { key: "manufacturingDate", width: 20 },
      { key: "expiryDate", width: 20 },
    ];

    const headers = [
      "Product Code",
      "Product Name",
      "Category",
      "Item Type",
      "Unit",
      "Min Stock",
      "Reorder Level",
      "Supplier Name",
      "Batch/Lot Number",
      "Initial Qty",
      "Unit Cost",
      "Mfg Date (YYYY-MM-DD)",
      "Exp Date (YYYY-MM-DD)",
    ];
    const headerRow = txSheet.getRow(1);
    headerRow.values = headers;

    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };

    await txSheet.protect("medoraa", {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
    });

    const catString = DEFAULT_CATEGORIES.join(",");
    const typeString = ITEM_TYPES.join(",");

    for (let i = 2; i <= 500; i++) {
      ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].forEach(
        (col) => {
          txSheet.getCell(`${col}${i}`).protection = { locked: false };
        },
      );

      // Category
      txSheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${catString}"`],
      };

      // Item Type
      txSheet.getCell(`D${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${typeString}"`],
      };

      txSheet.getCell(`F${i}`).numFmt = "0"; // min stock
      txSheet.getCell(`G${i}`).numFmt = "0"; // reorder
      txSheet.getCell(`J${i}`).numFmt = "0.00"; // qty
      txSheet.getCell(`K${i}`).numFmt = "#,##0.00"; // cost
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Medoraa_Labs_Inventory_Template.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Template Gen Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const parseExcelDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  const pd = new Date(val);
  if (!isNaN(pd.getTime())) return pd;
  return null;
};

const validateRowEntry = (
  productCode,
  name,
  category,
  itemType,
  unit,
  supplierName,
  batchNumber,
  quantity,
  unitCost,
  existingCodesMap,
) => {
  const errors = [];
  if (!productCode) errors.push("Product Code is required");
  else if (existingCodesMap.has(productCode.toString().trim()))
    errors.push("Product Code already exists in database");

  if (!name) errors.push("Product Name is required");
  if (!category) errors.push("Category is required");
  if (!itemType) errors.push("Item Type is required");
  if (!unit) errors.push("Unit is required");
  if (!supplierName) errors.push("Supplier Name is required");
  if (!batchNumber) errors.push("Batch Number is required");

  let parsedQty = parseFloat(quantity);
  if (isNaN(parsedQty) || parsedQty <= 0)
    errors.push("Quantity must be greater than zero");

  let parsedCost = parseFloat(unitCost);
  if (isNaN(parsedCost) || parsedCost < 0)
    errors.push("Unit Cost must be a valid number >= 0");

  return {
    parsedQty,
    parsedCost,
    errors,
  };
};

// @desc    Validate and Stage Excel Import
// @route   POST /api/admin/inventory/import/validate
exports.validateImport = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    const sourceHash = hashSum.digest("hex");

    const existing = await InventoryImportBatch.findOne({ sourceHash });
    if (existing) {
      return res.status(400).json({
        success: false,
        error:
          "This file has already been imported. Please do not duplicate imports.",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const txSheet =
      workbook.getWorksheet("Inventory_Import") || workbook.worksheets[0];
    if (!txSheet) {
      return res.status(400).json({
        success: false,
        error: "Invalid template structure.",
      });
    }

    // Pre-fetch all existing product codes to detect duplicates efficiently
    const allProducts = await InventoryProduct.find({}, "productCode");
    const existingCodes = new Set(allProducts.map((p) => p.productCode));

    let validCount = 0;
    let invalidCount = 0;

    const importBatchId = `INV-IMP-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(
        /-/g,
        "",
      )}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const batch = await InventoryImportBatch.create({
      importBatchId,
      fileName: req.file.originalname,
      importedBy: req.user.id,
      status: "DRAFT",
      sourceHash,
    });

    let draftRows = [];
    let seenCodesInFile = new Set();

    // Data starts at row 2
    txSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < 2) return;

      const getVal = (colIndex) => {
        const c = row.getCell(colIndex);
        return c ? c.value : null;
      };

      const productCode = getVal(1)?.toString()?.trim() || "";
      const name = getVal(2)?.toString()?.trim() || "";
      let category = getVal(3);
      if (
        typeof category === "object" &&
        category !== null &&
        category.result
      ) {
        category = category.result;
      }
      category = category?.toString()?.trim() || "";

      let itemType = getVal(4);
      if (
        typeof itemType === "object" &&
        itemType !== null &&
        itemType.result
      ) {
        itemType = itemType.result;
      }
      itemType = itemType?.toString()?.trim() || "";

      const unit = getVal(5)?.toString()?.trim() || "";
      const minimumStock = getVal(6);
      const reorderLevel = getVal(7);
      const supplierName = getVal(8)?.toString()?.trim() || "";
      const batchNumber = getVal(9)?.toString()?.trim() || "";
      const quantity = getVal(10);
      const unitCost = getVal(11);
      const mDate = parseExcelDate(getVal(12));
      const eDate = parseExcelDate(getVal(13));

      // Skip empty rows where at least code and name are missing
      if (!productCode && !name) return;

      const { parsedQty, parsedCost, errors } = validateRowEntry(
        productCode,
        name,
        category,
        itemType,
        unit,
        supplierName,
        batchNumber,
        quantity,
        unitCost,
        existingCodes,
      );

      if (productCode) {
        if (seenCodesInFile.has(productCode)) {
          errors.push(
            `Duplicate product code within the uploaded file: ${productCode}`,
          );
        } else {
          seenCodesInFile.add(productCode);
        }
      }

      if (eDate && mDate && mDate > eDate) {
        errors.push("Manufacturing date cannot be after expiry date");
      }

      const isValid = errors.length === 0;
      if (isValid) validCount++;
      else invalidCount++;

      draftRows.push({
        importBatchId: batch._id,
        rowNumber,
        productCode,
        name,
        category,
        itemType,
        unit,
        minimumStock: isNaN(parseFloat(minimumStock))
          ? 0
          : parseFloat(minimumStock),
        reorderLevel: isNaN(parseFloat(reorderLevel))
          ? 0
          : parseFloat(reorderLevel),
        supplierName,
        batchNumber,
        quantity: isNaN(parsedQty) ? 0 : parsedQty,
        unitCost: isNaN(parsedCost) ? 0 : parsedCost,
        manufacturingDate: mDate,
        expiryDate: eDate,
        validationStatus: isValid ? "VALID" : "INVALID",
        validationErrors: errors,
      });
    });

    if (draftRows.length > 0) {
      await InventoryImportRow.insertMany(draftRows);
    }

    batch.totalRows = validCount + invalidCount;
    batch.successfulRows = validCount;
    batch.failedRows = invalidCount;
    await batch.save();

    res.status(200).json({
      success: true,
      data: {
        batchId: batch._id,
        importBatchId: batch.importBatchId,
      },
    });
  } catch (error) {
    console.error("Validate Import Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get Draft Batch and Rows
// @route   GET /api/admin/inventory/import/:batchId
exports.getDraftBatch = async (req, res) => {
  try {
    const batch = await InventoryImportBatch.findById(req.params.batchId);
    if (!batch)
      return res.status(404).json({ success: false, error: "Batch not found" });

    const rows = await InventoryImportRow.find({
      importBatchId: batch._id,
    }).sort({
      rowNumber: 1,
    });

    res.status(200).json({ success: true, data: { batch, rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update a specific draft row
// @route   PUT /api/admin/inventory/import/row/:rowId
exports.updateDraftRow = async (req, res) => {
  try {
    const rowId = req.params.rowId;
    const {
      productCode,
      name,
      category,
      itemType,
      unit,
      minimumStock,
      reorderLevel,
      supplierName,
      batchNumber,
      quantity,
      unitCost,
      manufacturingDate,
      expiryDate,
    } = req.body;

    const row = await InventoryImportRow.findById(rowId);
    if (!row)
      return res.status(404).json({ success: false, error: "Row not found" });

    const batch = await InventoryImportBatch.findById(row.importBatchId);
    if (!batch)
      return res.status(404).json({ success: false, error: "Batch missing" });

    if (batch.status === "CONFIRMED")
      return res
        .status(400)
        .json({ success: false, error: "Batch already confirmed" });

    const allProducts = await InventoryProduct.find({}, "productCode");
    const existingCodes = new Set(allProducts.map((p) => p.productCode));

    const { parsedQty, parsedCost, errors } = validateRowEntry(
      productCode,
      name,
      category,
      itemType,
      unit,
      supplierName,
      batchNumber,
      quantity,
      unitCost,
      existingCodes,
    );

    const wasValid = row.validationStatus === "VALID";
    const isNowValid = errors.length === 0;

    row.productCode = productCode;
    row.name = name;
    row.category = category;
    row.itemType = itemType;
    row.unit = unit;
    row.minimumStock = isNaN(parseFloat(minimumStock))
      ? 0
      : parseFloat(minimumStock);
    row.reorderLevel = isNaN(parseFloat(reorderLevel))
      ? 0
      : parseFloat(reorderLevel);
    row.supplierName = supplierName;
    row.batchNumber = batchNumber;
    row.quantity = isNaN(parsedQty) ? 0 : parsedQty;
    row.unitCost = isNaN(parsedCost) ? 0 : parsedCost;
    row.manufacturingDate = manufacturingDate
      ? new Date(manufacturingDate)
      : null;
    row.expiryDate = expiryDate ? new Date(expiryDate) : null;

    row.validationStatus = isNowValid ? "VALID" : "INVALID";
    row.validationErrors = errors;

    await row.save();

    if (wasValid !== isNowValid) {
      if (isNowValid) {
        batch.successfulRows += 1;
        batch.failedRows -= 1;
      } else {
        batch.successfulRows -= 1;
        batch.failedRows += 1;
      }
      await batch.save();
    }

    res.status(200).json({ success: true, data: row });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete a specific draft row
// @route   DELETE /api/admin/inventory/import/row/:rowId
exports.deleteDraftRow = async (req, res) => {
  try {
    const rowId = req.params.rowId;
    const row = await InventoryImportRow.findById(rowId);
    if (!row)
      return res.status(404).json({ success: false, error: "Row not found" });

    const batch = await InventoryImportBatch.findById(row.importBatchId);
    if (!batch)
      return res.status(404).json({ success: false, error: "Batch missing" });

    if (batch.status === "CONFIRMED")
      return res
        .status(400)
        .json({ success: false, error: "Batch already confirmed" });

    if (row.validationStatus === "VALID") batch.successfulRows -= 1;
    else batch.failedRows -= 1;

    batch.totalRows -= 1;

    await row.deleteOne();
    await batch.save();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Add a manual row to draft batch
// @route   POST /api/admin/inventory/import/:batchId/row
exports.addDraftRow = async (req, res) => {
  try {
    const batch = await InventoryImportBatch.findById(req.params.batchId);
    if (!batch)
      return res.status(404).json({ success: false, error: "Batch not found" });

    if (batch.status === "CONFIRMED")
      return res
        .status(400)
        .json({ success: false, error: "Batch already confirmed" });

    const maxRowResult = await InventoryImportRow.findOne({
      importBatchId: batch._id,
    })
      .sort({ rowNumber: -1 })
      .limit(1);
    const nextRowNumber = maxRowResult ? maxRowResult.rowNumber + 1 : 2;

    const {
      productCode,
      name,
      category,
      itemType,
      unit,
      minimumStock,
      reorderLevel,
      supplierName,
      batchNumber,
      quantity,
      unitCost,
      manufacturingDate,
      expiryDate,
    } = req.body;

    const allProducts = await InventoryProduct.find({}, "productCode");
    const existingCodes = new Set(allProducts.map((p) => p.productCode));

    const { parsedQty, parsedCost, errors } = validateRowEntry(
      productCode,
      name,
      category,
      itemType,
      unit,
      supplierName,
      batchNumber,
      quantity,
      unitCost,
      existingCodes,
    );

    const isValid = errors.length === 0;

    const row = await InventoryImportRow.create({
      importBatchId: batch._id,
      rowNumber: nextRowNumber,
      productCode,
      name,
      category,
      itemType,
      unit,
      minimumStock: isNaN(parseFloat(minimumStock))
        ? 0
        : parseFloat(minimumStock),
      reorderLevel: isNaN(parseFloat(reorderLevel))
        ? 0
        : parseFloat(reorderLevel),
      supplierName,
      batchNumber,
      quantity: isNaN(parsedQty) ? 0 : parsedQty,
      unitCost: isNaN(parsedCost) ? 0 : parsedCost,
      manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      validationStatus: isValid ? "VALID" : "INVALID",
      validationErrors: errors,
    });

    if (isValid) batch.successfulRows += 1;
    else batch.failedRows += 1;

    batch.totalRows += 1;
    await batch.save();

    res.status(201).json({ success: true, data: row });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Confirm Import
// @route   POST /api/admin/inventory/import/confirm
exports.confirmImport = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { batchId } = req.body; // batchId is the ObjectId _id
    const batch = await InventoryImportBatch.findById(batchId).session(session);

    if (!batch) throw new Error("Batch not found");
    if (batch.status === "CONFIRMED")
      throw new Error("Batch already confirmed");

    const rows = await InventoryImportRow.find({
      importBatchId: batch._id,
    }).session(session);

    if (rows.length === 0) throw new Error("No rows found in this batch");

    const invalidRows = rows.filter((r) => r.validationStatus === "INVALID");
    if (invalidRows.length > 0)
      throw new Error(
        `Cannot confirm batch with ${invalidRows.length} invalid rows.`,
      );

    // Check intra-batch duplicates one more time just in case!
    const seenCodes = new Set();
    const allProducts = await InventoryProduct.find({}, "productCode").session(
      session,
    );
    const dbCodes = new Set(allProducts.map((p) => p.productCode));

    for (const r of rows) {
      if (dbCodes.has(r.productCode) || seenCodes.has(r.productCode)) {
        throw new Error(`Duplicate product code found: ${r.productCode}`);
      }
      seenCodes.add(r.productCode);
    }

    // Cache to prevent repeatedly creating the same supplier inside the transaction
    const supplierCache = new Map();

    for (const r of rows) {
      const sName = r.supplierName;
      let sId = supplierCache.get(sName);

      if (!sId) {
        let supplier = await Supplier.findOne({ name: sName }).session(session);
        if (!supplier) {
          supplier = await Supplier.create(
            [
              {
                name: sName,
                contactPerson: "Imported via Excel",
                phone: "N/A",
                createdBy: req.user.id,
              },
            ],
            { session },
          );
          supplier = supplier[0];
        }
        sId = supplier._id;
        supplierCache.set(sName, sId);
      }

      const product = await InventoryProduct.create(
        [
          {
            name: r.name,
            productCode: r.productCode,
            category: r.category,
            itemType: r.itemType,
            unit: r.unit,
            minimumStock: r.minimumStock,
            reorderLevel: r.reorderLevel,
            createdBy: req.user.id,
          },
        ],
        { session },
      );

      await InventoryBatch.create(
        [
          {
            productId: product[0]._id,
            supplierId: sId,
            batchNumber: r.batchNumber,
            quantity: r.quantity,
            availableQuantity: r.quantity,
            unitCost: r.unitCost,
            manufacturingDate: r.manufacturingDate,
            expiryDate: r.expiryDate,
            createdBy: req.user.id,
          },
        ],
        { session },
      );
    }

    batch.status = "CONFIRMED";
    await batch.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Confirm Import Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get import history
// @route   GET /api/admin/inventory/imports
exports.getImportHistory = async (req, res) => {
  try {
    const batches = await InventoryImportBatch.find()
      .populate("importedBy", "name")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: batches.length, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
