import express from "express";
import {
  createLoan,
  getLoans,
  getLoan,
  deleteLoan,
  markRepaymentPaid,
  updateLoan,
} from "../controllers/loanController.js";
import { requireAuthWithRole } from "../middlewares/auth.js";

const router = express.Router();

// Admin can create loan application for members
router.post("/create", requireAuthWithRole(["admin"]), createLoan);

// Get all loans (admin only)
router.get("/", requireAuthWithRole(["admin"]), getLoans);

// Get single loan (admin or member)
router.get("/:id", requireAuthWithRole(["admin", "member"]), getLoan);

// Update loan (admin only)
router.put("/:id", requireAuthWithRole(["admin"]), updateLoan);

// Delete loan (admin only)
router.delete("/:id", requireAuthWithRole(["admin"]), deleteLoan);

router.patch(
  "/repay/:loanId/:installmentNo",
  requireAuthWithRole(["admin"]),
  markRepaymentPaid
);

export default router;
