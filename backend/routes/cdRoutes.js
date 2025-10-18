import express from "express";
import {
  createCD,
  getAllCDs,
  getMemberCDs,
  getCDById,
  updateInstallment,
  withdrawFromCD,
  applyDividend,
  closeCD,
  deleteCD,
  updateCDAccount,
} from "../controllers/cdController.js";
import { requireAuthWithRole } from "../middlewares/auth.js";

const router = express.Router();

// Admin creates CD
router.post("/", requireAuthWithRole(["admin"]), createCD);

// Get all CDs
router.get("/", requireAuthWithRole(["admin"]), getAllCDs);

// Get member CDs
router.get(
  "/member/:memberId",
  requireAuthWithRole(["admin", "member"]),
  getMemberCDs
);

// Get single CD
router.get("/:cdId", requireAuthWithRole(["admin"]), getCDById);

// Update Installment Paid/Pending
router.patch(
  "/installment/:cdId/:installmentNo",
  requireAuthWithRole(["admin"]),
  updateInstallment
);

// Partial Withdrawal
router.post("/:cdId/withdraw", requireAuthWithRole(["admin"]), withdrawFromCD);

// Apply Dividend
router.post("/:cdId/dividend", requireAuthWithRole(["admin"]), applyDividend);

// Close CD
router.post("/:cdId/close", requireAuthWithRole(["admin"]), closeCD);

// Delete CD
router.delete("/:cdId", requireAuthWithRole(["admin"]), deleteCD);
router.put("/:cdId", requireAuthWithRole(["admin"]), updateCDAccount);

export default router;
