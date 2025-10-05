import express from "express";
import Member from "../models/memberModel.js";
import RD from "../models/rdAccount.js";
import FD from "../models/fdAccount.js";
import Loan from "../models/loanModel.js";
import { requireAuthWithRole } from "../middlewares/auth.js";

const router = express.Router();

router.get("/stats", requireAuthWithRole(["admin"]), async (req, res) => {
  try {
    const [members, rds, fds, loans] = await Promise.all([
      Member.countDocuments(),
      RD.countDocuments(),
      FD.countDocuments(),
      Loan.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        members,
        rds,
        fds,
        loans,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
