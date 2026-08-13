const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../config/roleauth");
const inventoryController = require("../controllers/inventoryController");
const mappingController = require("../controllers/mappingController");

// All inventory routes require authentication and specific role
router.use(authenticate);
// Assuming authorize(['admin', 'inventory']) if following your config/roleauth.js
// We will just use router.use(authorize(['admin', 'inventory']));
router.use(authorize(["admin", "inventory"]));

// --- Suppliers ---
router
  .route("/suppliers")
  .get(inventoryController.getSuppliers)
  .post(inventoryController.createSupplier);

router.route("/suppliers/:id").put(inventoryController.updateSupplier);

// --- Products ---
router
  .route("/products")
  .get(inventoryController.getProducts)
  .post(inventoryController.createProductAndInitialStock);

router
  .route("/products/:id")
  .get(inventoryController.getProduct)
  .put(inventoryController.updateProduct)
  .delete(inventoryController.deleteProduct);

// --- Import Routes ---
const inventoryImportController = require("../controllers/inventoryImportController");

router.route("/template").get(inventoryImportController.downloadTemplate);
router.post(
  "/import/validate",
  inventoryImportController.uploadExcel.single("file"),
  inventoryImportController.validateImport,
);
router.post("/import/confirm", inventoryImportController.confirmImport);
router.route("/imports").get(inventoryImportController.getImportHistory);

// Draft endpoints
router.route("/import/:batchId").get(inventoryImportController.getDraftBatch);
router
  .route("/import/row/:rowId")
  .put(inventoryImportController.updateDraftRow)
  .delete(inventoryImportController.deleteDraftRow);
router
  .route("/import/:batchId/row")
  .post(inventoryImportController.addDraftRow);

// --- Stocks / Batches ---
router.route("/products/:id/stock").post(inventoryController.addStock);

router.route("/products/:id/batches").get(inventoryController.getBatches);
router
  .route("/products/:id/batches/:batchId")
  .put(inventoryController.updateBatch)
  .delete(inventoryController.deleteBatch);

// ============================
// INVENTORY MAPPINGS
// ============================
router
  .route("/mappings")
  .get(mappingController.getMappings)
  .post(mappingController.createMapping);

router
  .route("/mappings/:id")
  .put(mappingController.updateMapping)
  .delete(mappingController.deleteMapping);

module.exports = router;
