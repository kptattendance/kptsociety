import express from "express";
import {
  createFD,
  getAllFDs,
  getMemberFDs,
  getFDById,
  updateFD,
  preCloseFD,
  closeFD,
  deleteFD,
  getFDWithdrawals,
  addFDWithdrawal,
  deleteFDWithdrawal,
} from "../controllers/fdController.js";

import { requireAuthWithRole, selfOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// 🔹 ADMIN ROUTES
// -------------------------------------------------------------

// ✅ Get all FDs (Admin dashboard)
router.get("/", requireAuthWithRole(["admin"]), getAllFDs);

// ✅ Create new FD
router.post("/", requireAuthWithRole(["admin"]), createFD);

// ✅ Update existing FD (Admin Edit)
router.put("/:fdId", requireAuthWithRole(["admin"]), updateFD);

router.delete(
  "/:fdId/withdrawal/:withdrawalId",
  requireAuthWithRole(["admin"]),
  deleteFDWithdrawal
);
// ✅ Delete FD (Admin only)
router.delete("/:fdId", requireAuthWithRole(["admin"]), deleteFD);

// ✅ Close FD (maturity or manual close)
router.put("/:fdId/close", requireAuthWithRole(["admin"]), closeFD);

// ✅ Pre-close FD (early withdrawal)
router.put("/:fdId/preclose", requireAuthWithRole(["admin"]), preCloseFD);

// -------------------------------------------------------------
// 🔹 MEMBER ROUTES
// -------------------------------------------------------------

// ✅ Get all FDs of a specific member
router.get(
  "/member/:memberId",
  requireAuthWithRole(["admin", "member"]),
  selfOrAdmin("memberId"),
  getMemberFDs
);

// ✅ Get a single FD by ID
router.get("/:fdId", requireAuthWithRole(["admin"]), getFDById);

router.post("/:fdId/withdraw", requireAuthWithRole(["admin"]), addFDWithdrawal);
router.get("/:fdId/withdrawals", requireAuthWithRole(["admin"]), getFDWithdrawals);
export default router;
