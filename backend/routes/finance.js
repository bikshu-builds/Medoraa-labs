const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const { authorize } = require("../config/roleauth");

// Protect all finance routes with Admin roles
router.use(authorize(["admin", "finance"]));

router.route("/summary").get(financeController.getSummary);
router
  .route("/transactions")
  .get(financeController.getTransactions)
  .post(financeController.addTransaction);

module.exports = router;
