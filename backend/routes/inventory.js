const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../config/roleauth");
const inventoryController = require("../controllers/inventoryController");

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

// --- Stocks / Batches ---
router.route("/products/:id/stock").post(inventoryController.addStock);

router.route("/products/:id/batches").get(inventoryController.getBatches);
router
  .route("/products/:id/batches/:batchId")
  .put(inventoryController.updateBatch)
  .delete(inventoryController.deleteBatch);

module.exports = router;
