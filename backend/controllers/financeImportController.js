const ExcelJS = require("exceljs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const FinanceTransaction = require("../models/FinanceTransaction");
const ImportBatch = require("../models/ImportBatch");
const FinanceImportRow = require("../models/FinanceImportRow");

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
      cb(new Error("Please upload a valid Excel (.xlsx) file."));
    }
  },
});

const DEFAULT_CATEGORIES = [
  "Patient Payment",
  "Laboratory Service",
  "Other Income",
  "Inventory / Laboratory Supplies",
  "Equipment",
  "Maintenance",
  "Rent",
  "Utilities",
  "Transportation",
  "Courier",
  "Staff",
  "Marketing",
  "Office",
  "Doctor Payment",
  "Other",
];

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Cheque",
  "Other",
];

// Helper for validating a single row
const validateRowEntry = (
  rawType,
  rawCategory,
  rawAmount,
  rawPayment,
  rawDate,
) => {
  const errors = [];
  let parsedDate;
  const typeStr = rawType?.toString()?.toUpperCase()?.trim();
  const amountNum = parseFloat(rawAmount);

  if (!rawDate) {
    errors.push("Date is required");
  } else {
    parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Invalid date format");
    }
  }

  if (typeStr !== "INCOME" && typeStr !== "EXPENSE") {
    errors.push(`Invalid Transaction Type.`);
  }

  if (!rawCategory) {
    errors.push("Category is required");
  }

  if (!rawPayment) {
    errors.push("Payment Method is required");
  }

  if (isNaN(amountNum) || amountNum <= 0) {
    errors.push("Amount must be a number greater than 0");
  }

  return {
    parsedDate,
    typeStr,
    amountNum,
    errors,
  };
};

// @desc    Download Finance Import Template
// @route   GET /api/admin/finance/template
exports.downloadTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Medoraa Labs";
    workbook.created = new Date();

    // Single Transactions Sheet
    const txSheet = workbook.addWorksheet("Transactions");

    // Column Definitions starting at Row 1
    txSheet.columns = [
      { key: "date", width: 15 },
      { key: "type", width: 22 },
      { key: "category", width: 25 },
      { key: "amount", width: 15 },
      { key: "paymentMethod", width: 20 },
      { key: "reference", width: 20 },
      { key: "description", width: 35 },
      { key: "notes", width: 35 },
    ];

    // Inject row headers at row 1
    const headers = [
      "Date (DD/MM/YYYY)",
      "Transaction Type",
      "Category",
      "Amount",
      "Payment Method",
      "Reference Number",
      "Description",
      "Notes",
    ];
    const headerRow = txSheet.getRow(1);
    headerRow.values = headers;

    // Style the transaction table header
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo
    };

    // Protect sheet (except entry rows)
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

    // Add Data Validation to rows 2 to 500
    const catString = DEFAULT_CATEGORIES.join(",");
    const payString = PAYMENT_METHODS.join(",");

    for (let i = 2; i <= 500; i++) {
      // Unlock all columns for the transaction entry rows!
      ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((col) => {
        txSheet.getCell(`${col}${i}`).protection = { locked: false };
      });

      // Transaction Type (Column B)
      txSheet.getCell(`B${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"INCOME,EXPENSE"'],
      };

      // Category (Column C)
      txSheet.getCell(`C${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${catString}"`],
      };

      // Payment Method (Column E)
      txSheet.getCell(`E${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${payString}"`],
      };

      // Amount Number Format
      txSheet.getCell(`D${i}`).numFmt = "#,##0.00";
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Medoraa_Labs_Finance_Template.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Template Gen Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Validate Excel File and create DRAFT
// @route   POST /api/admin/finance/import/validate
exports.validateImport = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload a file." });
    }

    const sourceHash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    // Check Duplicate Import
    const existingBatch = await ImportBatch.findOne({
      sourceHash,
      status: { $in: ["IMPORTED", "CONFIRMED"] },
    });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        error:
          "This file has already been imported. Please do not duplicate imports.",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const txSheet = workbook.getWorksheet("Transactions");
    if (!txSheet) {
      return res.status(400).json({
        success: false,
        error: "Invalid template: missing 'Transactions' sheet.",
      });
    }

    let insertPromises = [];
    let totalIncome = 0;
    let totalExpense = 0;
    let validCount = 0;
    let invalidCount = 0;

    // We expect headers at row 1 usually.
    let headerRowIndex = 1;
    let headerMap = {};
    const headerRow = txSheet.getRow(1);
    if (
      headerRow.getCell(1).value &&
      headerRow.getCell(1).value.toString().includes("Date")
    ) {
      headerRow.eachCell((cell, colNumber) => {
        if (cell.value)
          headerMap[cell.value.toString().split(" ")[0]] = colNumber; // Split to match "Date" vs "Date (DD...)"
      });
    } else {
      // Fallback if modified
      headerMap = {
        Date: 1,
        Transaction: 2,
        Category: 3,
        Amount: 4,
        Payment: 5,
        Reference: 6,
        Description: 7,
        Notes: 8,
      };
    }

    const importBatchId = `IMP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const batch = await ImportBatch.create({
      importBatchId,
      fileName: req.file.originalname,
      importedBy: req.user.id,
      status: "DRAFT",
      sourceHash,
    });

    let draftRows = [];
    // Data starts at row 2
    txSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < 2) return;

      const getVal = (colIndex) => {
        const c = row.getCell(colIndex);
        return c ? c.value : null;
      };

      const rawDate = getVal(1);
      const rawType = getVal(2);
      const rawCategory = getVal(3);
      const rawAmount = getVal(4);
      const rawPayment = getVal(5);
      const referenceNumber = getVal(6)?.toString() || "";
      const description = getVal(7)?.toString() || "";
      const notes = getVal(8)?.toString() || "";

      if (!rawDate && !rawType && !rawAmount) return; // Skip totally empty row

      const { parsedDate, typeStr, amountNum, errors } = validateRowEntry(
        rawType,
        rawCategory,
        rawAmount,
        rawPayment,
        rawDate,
      );

      const isValid = errors.length === 0;

      if (isValid) {
        validCount++;
        if (typeStr === "INCOME") totalIncome += amountNum;
        if (typeStr === "EXPENSE") totalExpense += amountNum;
      } else {
        invalidCount++;
      }

      draftRows.push({
        importBatchId: batch._id,
        rowNumber,
        date: isNaN(parsedDate?.getTime()) ? null : parsedDate,
        type:
          typeStr === "INCOME" || typeStr === "EXPENSE" ? typeStr : undefined,
        category: rawCategory?.toString()?.trim() || "",
        amount: isNaN(amountNum) ? null : amountNum,
        paymentMethod: rawPayment?.toString()?.trim() || "",
        referenceNumber,
        description,
        notes,
        validationStatus: isValid ? "VALID" : "INVALID",
        validationErrors: errors,
      });
    });

    if (draftRows.length > 0) {
      await FinanceImportRow.insertMany(draftRows);
    }

    batch.totalRows = validCount + invalidCount;
    batch.successfulRows = validCount;
    batch.failedRows = invalidCount;
    batch.totalIncome = totalIncome;
    batch.totalExpense = totalExpense;
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
// @route   GET /api/admin/finance/import/:batchId
exports.getDraftBatch = async (req, res) => {
  try {
    const batch = await ImportBatch.findById(req.params.batchId);
    if (!batch)
      return res.status(404).json({ success: false, error: "Batch not found" });

    const rows = await FinanceImportRow.find({ importBatchId: batch._id }).sort(
      { rowNumber: 1 },
    );

    res.status(200).json({ success: true, data: { batch, rows } });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update a specific draft row
// @route   PUT /api/admin/finance/import/row/:rowId
exports.updateDraftRow = async (req, res) => {
  try {
    const rowId = req.params.rowId;
    const {
      date,
      type,
      category,
      amount,
      paymentMethod,
      referenceNumber,
      description,
      notes,
    } = req.body;

    let draftRow = await FinanceImportRow.findById(rowId);
    if (!draftRow)
      return res.status(404).json({ success: false, error: "Row not found" });

    const { parsedDate, typeStr, amountNum, errors } = validateRowEntry(
      type,
      category,
      amount,
      paymentMethod,
      date,
    );
    const isValid = errors.length === 0;

    draftRow.date = parsedDate;
    draftRow.type = typeStr;
    draftRow.category = category;
    draftRow.amount = amountNum;
    draftRow.paymentMethod = paymentMethod;
    draftRow.referenceNumber = referenceNumber;
    draftRow.description = description;
    draftRow.notes = notes;
    draftRow.validationStatus = isValid ? "VALID" : "INVALID";
    draftRow.validationErrors = errors;

    await draftRow.save();

    // Recalculate Batch Totals
    await recalculateBatchTotals(draftRow.importBatchId);

    res.status(200).json({ success: true, data: draftRow });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Delete a draft row
// @route   DELETE /api/admin/finance/import/row/:rowId
exports.deleteDraftRow = async (req, res) => {
  try {
    const draftRow = await FinanceImportRow.findById(req.params.rowId);
    if (!draftRow)
      return res.status(404).json({ success: false, error: "Row not found" });

    await FinanceImportRow.findByIdAndDelete(req.params.rowId);

    await recalculateBatchTotals(draftRow.importBatchId);

    res.status(200).json({ success: true, message: "Row deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Add a manual draft row
// @route   POST /api/admin/finance/import/:batchId/row
exports.addDraftRow = async (req, res) => {
  try {
    const { batchId } = req.params;
    const {
      date,
      type,
      category,
      amount,
      paymentMethod,
      referenceNumber,
      description,
      notes,
    } = req.body;

    const batch = await ImportBatch.findById(batchId);
    if (!batch || batch.status !== "DRAFT") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid batch or not in draft state" });
    }

    const { parsedDate, typeStr, amountNum, errors } = validateRowEntry(
      type,
      category,
      amount,
      paymentMethod,
      date,
    );
    const isValid = errors.length === 0;

    // Get max row number to append
    const maxRowResult = await FinanceImportRow.findOne({
      importBatchId: batchId,
    }).sort("-rowNumber");
    const newRowNumber = maxRowResult ? maxRowResult.rowNumber + 1 : 1;

    const draftRow = await FinanceImportRow.create({
      importBatchId: batchId,
      rowNumber: newRowNumber,
      date: parsedDate,
      type: typeStr,
      category,
      amount: amountNum,
      paymentMethod,
      referenceNumber,
      description,
      notes,
      validationStatus: isValid ? "VALID" : "INVALID",
      validationErrors: errors,
    });

    await recalculateBatchTotals(batchId);

    res.status(201).json({ success: true, data: draftRow });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Helper to recalculate batch totals
const recalculateBatchTotals = async (batchId) => {
  const rows = await FinanceImportRow.find({ importBatchId: batchId });
  let totalIncome = 0;
  let totalExpense = 0;
  let validCount = 0;
  let invalidCount = 0;

  rows.forEach((r) => {
    if (r.validationStatus === "VALID") {
      validCount++;
      if (r.type === "INCOME") totalIncome += r.amount || 0;
      if (r.type === "EXPENSE") totalExpense += r.amount || 0;
    } else {
      invalidCount++;
    }
  });

  await ImportBatch.findByIdAndUpdate(batchId, {
    totalRows: validCount + invalidCount,
    successfulRows: validCount,
    failedRows: invalidCount,
    totalIncome,
    totalExpense,
  });
};

// @desc    Confirm Import
// @route   POST /api/admin/finance/import/confirm
exports.confirmImport = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { batchId } = req.body;
    const batch = await ImportBatch.findById(batchId).session(session);
    if (!batch || batch.status !== "DRAFT") {
      throw new Error("Invalid batch or already confirmed.");
    }

    const rows = await FinanceImportRow.find({
      importBatchId: batch._id,
      validationStatus: "VALID",
    }).session(session);

    if (rows.length === 0) {
      throw new Error("No valid rows to import.");
    }

    const txDocs = rows.map((row) => ({
      type: row.type,
      category: row.category,
      amount: row.amount,
      date: new Date(row.date),
      paymentMethod: row.paymentMethod,
      referenceNumber: row.referenceNumber,
      description: row.description,
      notes: row.notes,
      sourceType: "EXCEL_IMPORT",
      importBatchId: batch._id,
      createdBy: req.user.id,
    }));

    await FinanceTransaction.insertMany(txDocs, { session });

    batch.status = "CONFIRMED";
    await batch.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Successfully imported ${rows.length} transactions.`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Confirm Import Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Import History
// @route   GET /api/admin/finance/imports
exports.getImportHistory = async (req, res) => {
  try {
    const batches = await ImportBatch.find()
      .populate("importedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    console.error("Import History Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
