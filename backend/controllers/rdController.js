import RD from "../models/rdAccount.js";
import Member from "../models/memberModel.js";
import mongoose from "mongoose";

// ------------------- Create RD -------------------
export const createRD = async (req, res) => {
  try {
    const {
      accountNumber,
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
      accountNumber,
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
    const rds = await RD.find().populate("memberId", "name email phone photo");
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

    const rds = await RD.find(query).populate(
      "memberId",
      "name email phone photo"
    );

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
    const { paymentMode, reference, notes } = req.body;

    // Fetch RD
    const rd = await RD.findById(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });
    if (rd.status !== "Active")
      return res.status(400).json({ error: "RD not active" });

    // Find next pending installment
    const nextInstallment = rd.installments.find((i) => i.status === "Pending");
    if (!nextInstallment)
      return res.status(400).json({ error: "All installments paid" });

    // Mark installment as paid
    nextInstallment.status = "Paid";
    nextInstallment.paidAt = new Date();
    nextInstallment.paymentMode = paymentMode;
    nextInstallment.reference = reference;
    nextInstallment.notes = notes;

    // Recalculate totalDeposited based on all paid installments
    rd.totalDeposited = rd.installments
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + i.amount, 0);

    await rd.save();
    res.json(rd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Utility: calculate maturity date and amount
const calculateMaturity = (
  depositAmount,
  tenureMonths,
  interestRate,
  startDate
) => {
  const start = new Date(startDate);
  const maturityDate = new Date(start);
  maturityDate.setMonth(maturityDate.getMonth() + Number(tenureMonths));

  // Simple interest formula: A = P * (1 + r*n)
  const monthlyRate = Number(interestRate) / 100 / 12;
  const n = Number(tenureMonths);
  const maturityAmount = Number(depositAmount) * ((1 + monthlyRate * n) * n);

  return { maturityDate, maturityAmount };
};

export const updateRD = async (req, res) => {
  try {
    const { rdId } = req.params;
    const updates = req.body;

    // Fetch existing RD
    const rd = await RD.findById(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });

    // Validate accountNumber uniqueness if changed
    if (updates.accountNumber && updates.accountNumber !== rd.accountNumber) {
      const exists = await RD.findOne({ accountNumber: updates.accountNumber });
      if (exists)
        return res.status(400).json({ error: "Account number already exists" });
    }

    // Update allowed fields
    const allowedFields = [
      "accountNumber",
      "depositAmount",
      "interestRate",
      "tenureMonths",
      "startDate",
      "notes",
      "status",
    ];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) rd[field] = updates[field];
    });

    // Recalculate maturity if relevant fields changed
    if (
      updates.depositAmount ||
      updates.interestRate ||
      updates.tenureMonths ||
      updates.startDate
    ) {
      const { maturityDate, maturityAmount } = calculateMaturity(
        rd.depositAmount,
        rd.tenureMonths,
        rd.interestRate,
        rd.startDate
      );
      rd.maturityDate = maturityDate;
      rd.maturityAmount = maturityAmount;
    }

    await rd.save();

    res.json(rd);
  } catch (err) {
    console.error(err);
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

// ------------------- Update RD Installment Status -------------------
export const updateRDInstallmentStatus = async (req, res) => {
  try {
    const { rdId, installmentNo } = req.params;
    const { status, dueDate } = req.body; // <-- accept updated due date

    const rd = await RD.findById(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });

    const installmentIndex = Number(installmentNo) - 1;
    if (installmentIndex < 0 || installmentIndex >= rd.installments.length) {
      return res.status(400).json({ error: "Invalid installment number" });
    }

    const inst = rd.installments[installmentIndex];

    // Update status
    if (status === "Paid") {
      inst.status = "Paid";
      inst.paidAt = new Date();
    } else if (status === "Pending") {
      inst.status = "Pending";
      inst.paidAt = null;
    } else {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update due date if provided
    if (dueDate) {
      inst.dueDate = new Date(dueDate);
    }

    // Recalculate totalDeposited from all paid installments
    rd.totalDeposited = rd.installments
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + i.amount, 0);

    await rd.save();
    res.json(rd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Utility: Find RD by Mongo ID or Clerk ID -------------------
const findRD = async (idOrClerk) => {
  let rd = null;
  // Check if it's a valid Mongo ObjectId
  if (mongoose.Types.ObjectId.isValid(idOrClerk)) {
    // Try as RD _id
    rd = await RD.findById(idOrClerk);
    if (rd) return rd;

    // Try as memberId
    rd = await RD.findOne({ memberId: idOrClerk });
    if (rd) return rd;
  }

  // Otherwise treat as clerkId
  rd = await RD.findOne({ clerkId: idOrClerk });
  return rd;
};

// ------------------- Record a Withdrawal -------------------
export const makeRDWithdrawal = async (req, res) => {
  try {
    const { rdId } = req.params; // can be RD _id or Clerk ID
    const { amount, chequeNumber, chequeDate, notes } = req.body;

    const rd = await findRD(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });
    if (rd.status !== "Active")
      return res.status(400).json({ error: "RD not active" });

    // Ensure withdrawals array exists
    if (!rd.withdrawals) rd.withdrawals = [];

    const totalWithdrawn = rd.withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = rd.totalDeposited - totalWithdrawn;
    if (amount > availableBalance)
      return res
        .status(400)
        .json({ error: "Withdrawal exceeds available balance" });

    rd.withdrawals.push({
      amount,
      chequeNumber,
      chequeDate: chequeDate ? new Date(chequeDate) : null,
      withdrawnAt: new Date(),
      notes,
    });

    await rd.save();
    res.json(rd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get RD Details (Flexible) -------------------
export const getRDByIdOrClerk = async (req, res) => {
  try {
    const { rdId } = req.params; // can be RD _id or Clerk ID
    const rd = await findRD(rdId);
    if (!rd) return res.status(404).json({ error: "RD not found" });

    // Populate member if available
    await rd.populate("memberId", "name email phone photo");

    res.json(rd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
