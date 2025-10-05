// routes/rdRoutes.js
import express from "express";
import {
  createRD,
  getMemberRDs,
  getRDById,
  makeRDDeposit,
  updateRD,
  closeRD,
  deleteRD,
  getAllRDs,
} from "../controllers/rdController.js";
import { requireAuthWithRole } from "../middlewares/auth.js";

const router = express.Router();

// Create RD

router.post("/", requireAuthWithRole(["admin"]), createRD);
router.get("/", requireAuthWithRole(["admin"]), getAllRDs);

// Get all RDs for a member
router.get(
  "/member/:memberId",
  requireAuthWithRole(["admin", "member"]),
  getMemberRDs
);

// Get single RD
router.get("/:rdId", requireAuthWithRole(["admin", "member"]), getRDById);

// Make installment payment
router.post("/deposit/:rdId", requireAuthWithRole(["admin"]), makeRDDeposit);

// Update RD
router.put("/:rdId", requireAuthWithRole(["admin"]), updateRD);

// Close RD
router.put("/close/:rdId", requireAuthWithRole(["admin"]), closeRD);

// Delete RD (admin use only)
router.delete("/:rdId", requireAuthWithRole(["admin"]), deleteRD);

export default router;
