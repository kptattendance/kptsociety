import FD from "../models/fdAccount.js";
import Member from "../models/memberModel.js";
import mongoose from "mongoose";

// -------------------------------------------------------------------
// ✅ Create New FD
// -------------------------------------------------------------------
export const createFD = async (req, res) => {
  try {
    const {
      fdNumber,
      memberId,
      principal,
      interestRate,
      tenureMonths,
      startDate,
      compoundingFrequency,
      payoutFrequency,
      nominee,
      autoRenew,
      preclosureAllowed,
      preclosurePenaltyPercent,
      notes,
    } = req.body;

    // ✅ Validate member
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    // ✅ Check FD Number uniqueness
    const existingFD = await FD.findOne({ fdNumber });
    if (existingFD)
      return res.status(400).json({ error: "FD number already exists" });

    // ✅ Calculate maturity date
    const start = startDate ? new Date(startDate) : new Date();
    const maturityDate = new Date(start);
    maturityDate.setMonth(maturityDate.getMonth() + Number(tenureMonths));

    // ✅ Generate system account number
    const accountNumber = `FD-${Date.now()}`;

    // ✅ Compute maturity amount (simple compound interest)
    const years = tenureMonths / 12;
    const maturityAmount = principal * Math.pow(1 + interestRate / 100, years);

    const fd = new FD({
      fdNumber,
      accountNumber,
      memberId: member._id,
      clerkId: member.clerkId || null,
      principal,
      tenureMonths,
      interestRate,
      startDate: start,
      maturityDate,
      compoundingFrequency: compoundingFrequency || "monthly",
      payoutFrequency: payoutFrequency || "maturity",
      nominee,
      autoRenew: autoRenew || false,
      preclosureAllowed: preclosureAllowed ?? true,
      preclosurePenaltyPercent: preclosurePenaltyPercent ?? 1.0,
      maturityAmount,
      notes,
      status: "Active",
    });

    await fd.save();
    res.status(201).json(fd);
  } catch (err) {
    console.error("FD creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Get ALL FDs
// -------------------------------------------------------------------
export const getAllFDs = async (req, res) => {
  try {
    const fds = await FD.find()
      .populate("memberId", "name email photo phone")
      .sort({ createdAt: -1 });
    res.json(fds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Get FDs by Member ID or Clerk ID
// -------------------------------------------------------------------
export const getMemberFDs = async (req, res) => {
  try {
    const { memberId } = req.params;
    let member;

    if (mongoose.Types.ObjectId.isValid(memberId)) {
      member = await Member.findById(memberId);
    }
    if (!member) {
      member = await Member.findOne({ clerkId: memberId });
    }

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const fds = await FD.find({ memberId: member._id })
      .populate("memberId", "name email photo phone")
      .sort({ createdAt: -1 });

    res.json(fds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Get Single FD
// -------------------------------------------------------------------
export const getFDById = async (req, res) => {
  try {
    const fd = await FD.findById(req.params.fdId).populate(
      "memberId",
      "name email"
    );
    if (!fd) return res.status(404).json({ error: "FD not found" });
    res.json(fd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Update FD
// -------------------------------------------------------------------
export const updateFD = async (req, res) => {
  try {
    const fd = await FD.findByIdAndUpdate(req.params.fdId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fd) return res.status(404).json({ message: "FD not found" });
    res.json(fd);
  } catch (error) {
    res.status(400).json({ message: "Error updating FD", error });
  }
};

// -------------------------------------------------------------------
// ✅ Pre-close FD
// -------------------------------------------------------------------
export const preCloseFD = async (req, res) => {
  try {
    const { fdId } = req.params;
    const fd = await FD.findById(fdId);
    if (!fd) return res.status(404).json({ error: "FD not found" });
    if (fd.status !== "Active")
      return res.status(400).json({ error: "FD is not active" });

    const now = new Date();
    fd.status = "PreClosed";
    fd.closedAt = now;

    const durationYears = (now - fd.startDate) / (1000 * 60 * 60 * 24 * 365);
    const effectiveRate =
      fd.interestRate - (fd.interestRate * fd.preclosurePenaltyPercent) / 100;

    const maturityAmount =
      fd.principal * Math.pow(1 + effectiveRate / 100, durationYears);

    fd.maturityAmount = maturityAmount.toFixed(2);
    await fd.save();

    res.json(fd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Close FD
// -------------------------------------------------------------------
export const closeFD = async (req, res) => {
  try {
    const fd = await FD.findById(req.params.fdId);
    if (!fd) return res.status(404).json({ message: "FD not found" });

    fd.status = "Closed";
    fd.closedAt = new Date();
    await fd.save();

    res.json({ message: "FD closed successfully", fd });
  } catch (error) {
    res.status(400).json({ message: "Error closing FD", error });
  }
};

// -------------------------------------------------------------------
// ✅ Delete FD
// -------------------------------------------------------------------
export const deleteFD = async (req, res) => {
  try {
    const fd = await FD.findByIdAndDelete(req.params.fdId);
    if (!fd) return res.status(404).json({ message: "FD not found" });
    res.json({ message: "FD deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting FD", error });
  }
};
// -------------------------------------------------------------------
// ✅ Add Withdrawal to FD
// -------------------------------------------------------------------
export const addFDWithdrawal = async (req, res) => {
  try {
    const { fdId } = req.params;
    const { amount, reason, chequeNumber, chequeDate, paymentMode } = req.body;

    const fd = await FD.findById(fdId);
    if (!fd) return res.status(404).json({ error: "FD not found" });
    if (fd.status !== "Active")
      return res.status(400).json({ error: "FD is not active" });

    if (amount <= 0)
      return res.status(400).json({ error: "Invalid withdrawal amount" });

    const remainingPrincipal = fd.principal - amount;
    if (remainingPrincipal < 0)
      return res
        .status(400)
        .json({ error: "Withdrawal amount exceeds remaining principal" });

    // ✅ Update principal
    fd.principal = remainingPrincipal;

    // ✅ Recalculate maturity amount
    const years = fd.tenureMonths / 12;
    fd.maturityAmount = (
      remainingPrincipal * Math.pow(1 + fd.interestRate / 100, years)
    ).toFixed(2);

    // ✅ Push withdrawal record
    fd.withdrawals.push({
      amount,
      reason,
      chequeNumber,
      chequeDate,
      paymentMode,
      clerkId: req.userId || null,
      date: new Date(),
    });

    await fd.save();

    res.json({ message: "Withdrawal added successfully", fd });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------------
// ✅ Get all withdrawals of a FD
// -------------------------------------------------------------------
export const getFDWithdrawals = async (req, res) => {
  try {
    const { fdId } = req.params;
    const fd = await FD.findById(fdId).populate("memberId", "name email phone");
    if (!fd) return res.status(404).json({ error: "FD not found" });

    res.json(fd.withdrawals);
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ error: error.message });
  }
};
