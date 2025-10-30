import express from "express";
import {
  getAllShares,
  getMemberShares,
  createOrAddShares,
  closeShareAccount,
  deleteShareAccount,
  updateShareAccount,
  withdrawFromShareAccount,
  deletePurchaseEntry,
  updatePurchaseEntry,
} from "../controllers/shareController.js";
import { requireAuthWithRole } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Update a specific purchase record
router.put(
  "/:shareId/purchase/:purchaseIndex",
  requireAuthWithRole(["admin"]),
  updatePurchaseEntry
);

// ✅ Delete a specific purchase record
router.delete(
  "/:shareId/purchase/:purchaseIndex",
  requireAuthWithRole(["admin"]),
  deletePurchaseEntry
);
// ✅ Create or add shares to a member
router.post("/", requireAuthWithRole(["admin"]), createOrAddShares);

// ✅ Get all shares (Admin)
router.get("/", requireAuthWithRole(["admin"]), getAllShares);

// ✅ Get shares of a specific member (by Mongo ID or Clerk ID)
router.get(
  "/:memberId",
  requireAuthWithRole(["admin", "member"]),
  getMemberShares
);

// ✅ Update a share record
router.put("/:shareId", requireAuthWithRole(["admin"]), updateShareAccount);

// ✅ Close a member’s share account (on resignation)
router.post(
  "/close/:shareId",
  requireAuthWithRole(["admin"]),
  closeShareAccount
);

// ✅ Delete a share record (Admin)
router.delete("/:shareId", requireAuthWithRole(["admin"]), deleteShareAccount);

router.post("/withdraw/:shareId", withdrawFromShareAccount);

export default router;
