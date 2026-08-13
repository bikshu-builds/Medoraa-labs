const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const financeImportController = require("../controllers/financeImportController");
const { authorize } = require("../config/roleauth");

// Protect all finance routes with Admin roles
router.use(authorize(["admin", "finance"]));

router.route("/summary").get(financeController.getSummary);
router
  .route("/transactions")
  .get(financeController.getTransactions)
  .post(financeController.addTransaction);

// Import Routes
router.route("/template").get(financeImportController.downloadTemplate);

router.post(
  "/import/validate",
  financeImportController.uploadExcel.single("file"),
  financeImportController.validateImport,
);
router.post("/import/confirm", financeImportController.confirmImport);
router.route("/imports").get(financeImportController.getImportHistory);

// Draft endpoints
router.route("/import/:batchId").get(financeImportController.getDraftBatch);
router
  .route("/import/row/:rowId")
  .put(financeImportController.updateDraftRow)
  .delete(financeImportController.deleteDraftRow);
router.route("/import/:batchId/row").post(financeImportController.addDraftRow);

module.exports = router;
