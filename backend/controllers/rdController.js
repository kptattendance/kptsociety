import RD from "../models/rdAccount.js";
import Member from "../models/memberModel.js";
import mongoose from "mongoose";

// ------------------- Create RD -------------------
export const createRD = async (req, res) => {
  try {
    const {
      memberId,
      depositAmount,
      interestRate,
      tenureMonths,
      startDate,
      dueDayOfMonth,
      gracePeriodDays,
      lateFeePerInstallment,
      notes,
    } = req.body;

    // Validate member exists
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const start = startDate ? new Date(startDate) : new Date();
    const maturityDate = new Date(start);
    maturityDate.setMonth(maturityDate.getMonth() + Number(tenureMonths));

    // Precompute maturity amount (simple CI formula)
    const years = tenureMonths / 12;
    const maturityAmount =
      depositAmount * tenureMonths * (1 + (interestRate / 100) * years);

    // Generate installment schedule
    const installments = [];
    for (let i = 0; i < tenureMonths; i++) {
      const due = new Date(start);
      due.setMonth(due.getMonth() + i);
      if (dueDayOfMonth) due.setDate(dueDayOfMonth);
      installments.push({
        dueDate: due,
        amount: depositAmount,
        status: "Pending",
      });
    }

    const rd = new RD({
      accountNumber: `RD-${Date.now()}`,
      memberId,
      clerkId: member.clerkId,
      depositAmount,
      tenureMonths,
      interestRate,
      startDate: start,
      maturityDate,
      totalDeposited: 0,
      maturityAmount,
      installments,
      dueDayOfMonth,
      gracePeriodDays: gracePeriodDays ?? 7,
      lateFeePerInstallment: lateFeePerInstallment ?? 0,
      notes,
      status: "Active",
    });

    await rd.save();
    res.status(201).json(rd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllRDs = async (req, res) => {
  try {
    const rds = await RD.find().populate("memberId", "name email");
    res.json(rds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get all RDs of a member -------------------

export const getMemberRDs = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check if the passed ID is a valid Mongo ObjectId
    const isMongoId = mongoose.Types.ObjectId.isValid(memberId);

    // Build query condition dynamically
    const query = isMongoId
      ? { memberId } // Mongo ObjectId of Member collection
      : { clerkId: memberId }; // Clerk user ID (string)

    const rds = await RD.find(query).populate("memberId", "name email");

    res.json(rds);
  } catch (err) {
    console.error("Error in getMemberRDs:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get RD by ID -------------------
export const getRDById = async (req, res) => {
  try {
    const rd = await RD.findById(req.params.rdId).populate(
      "memberId",
      "name email"
    );
    if (!rd) return res.status(404).json({ error: "RD not found" });
    res.json(rd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Make installment payment -------------------
export const makeRDDeposit = async (req, res) => {
  try {
    const { rdId } = req.params;
    const { amount, paymentMode, reference, notes } = req.body;

    const rd = await RD.findById(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });
    if (rd.status !== "Active")
      return res.status(400).json({ error: "RD not active" });

    // Find next pending installment
    const nextInstallment = rd.installments.find((i) => i.status === "Pending");
    if (!nextInstallment)
      return res.status(400).json({ error: "All installments paid" });

    nextInstallment.status = "Paid";
    nextInstallment.paidAt = new Date();
    nextInstallment.paymentMode = paymentMode;
    nextInstallment.reference = reference;
    nextInstallment.notes = notes;

    // Update totalDeposited
    rd.totalDeposited += amount;

    await rd.save();
    res.json(rd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Update RD -------------------
export const updateRD = async (req, res) => {
  try {
    const { rdId } = req.params;
    const updates = req.body;

    const rd = await RD.findByIdAndUpdate(rdId, updates, {
      new: true,
      runValidators: true,
    });
    if (!rd) return res.status(404).json({ error: "RD not found" });

    res.json(rd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Close RD -------------------
export const closeRD = async (req, res) => {
  try {
    const { rdId } = req.params;
    const { premature } = req.body;

    const rd = await RD.findById(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });
    if (rd.status !== "Active")
      return res.status(400).json({ error: "RD already closed" });

    rd.status = "Closed";
    rd.closedAt = new Date();

    // Calculate maturity amount
    const totalDeposits = rd.totalDeposited;
    const timeYears =
      (rd.closedAt - rd.startDate) / (1000 * 60 * 60 * 24 * 365);

    let maturityAmount;
    if (premature) {
      // Apply 1% penalty on interest for premature
      maturityAmount =
        totalDeposits * (1 + ((rd.interestRate - 1) / 100) * timeYears);
    } else {
      maturityAmount = rd.maturityAmount; // full amount precomputed
    }

    rd.maturityAmount = maturityAmount.toFixed(2);

    await rd.save();
    res.json(rd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Delete RD -------------------
export const deleteRD = async (req, res) => {
  try {
    const { rdId } = req.params;
    const rd = await RD.findByIdAndDelete(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });

    res.json({ message: "RD deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
