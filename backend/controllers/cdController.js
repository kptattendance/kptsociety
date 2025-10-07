import CD from "../models/cdAccount.js";
import Member from "../models/memberModel.js";
import mongoose from "mongoose";

// ------------------- Create CD Account -------------------
export const createCD = async (req, res) => {
  try {
    const { memberId, monthlyDeposit, startDate } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const existingCD = await CD.findOne({ memberId });
    if (existingCD)
      return res.status(400).json({ error: "CD account already exists" });

    const cd = new CD({
      accountNumber: `CD-${Date.now()}`,
      memberId,
      clerkId: member.clerkId,
      monthlyDeposit: monthlyDeposit || 500,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      installments: [], // created dynamically
    });

    // Generate first 12 installments
    const start = new Date(startDate || new Date());
    for (let i = 0; i < 12; i++) {
      const due = new Date(start);
      due.setMonth(start.getMonth() + i);

      cd.installments.push({
        monthNo: i + 1,
        dueDate: due,
        amount: cd.monthlyDeposit,
        status: "Pending",
      });
    }

    await cd.save();
    res.status(201).json(cd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get all CDs -------------------
export const getAllCDs = async (req, res) => {
  try {
    const cds = await CD.find().populate("memberId", "name email phone photo");
    res.json(cds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get Member CDs -------------------
export const getMemberCDs = async (req, res) => {
  try {
    const { memberId } = req.params;

    const isMongoId = mongoose.Types.ObjectId.isValid(memberId);
    const query = isMongoId ? { memberId } : { clerkId: memberId };

    const cds = await CD.find(query).populate(
      "memberId",
      "name email phone photo"
    );

    res.json(cds);
  } catch (err) {
    console.error("Error fetching member CDs:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get CD by ID -------------------
export const getCDById = async (req, res) => {
  try {
    const cd = await CD.findById(req.params.cdId).populate(
      "memberId",
      "name email phone photo"
    );
    if (!cd) return res.status(404).json({ error: "CD not found" });
    res.json(cd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Mark Installment Paid/Pending -------------------
export const updateInstallment = async (req, res) => {
  try {
    const { cdId, installmentNo } = req.params;
    const { status, clerkId } = req.body;

    const cd = await CD.findById(cdId);
    if (!cd) return res.status(404).json({ error: "CD not found" });

    const inst = cd.installments.find(
      (i) => i.monthNo === parseInt(installmentNo)
    );
    if (!inst) return res.status(404).json({ error: "Installment not found" });

    inst.status = status;
    inst.paidAt = status === "Paid" ? new Date() : null;
    inst.clerkId = clerkId || inst.clerkId;

    if (status === "Paid") {
      cd.totalDeposited += inst.amount;
      cd.balance += inst.amount;
      cd.transactions.push({
        type: "Deposit",
        amount: inst.amount,
        date: new Date(),
        clerkId,
      });
    }

    if (
      parseInt(installmentNo) === cd.installments.length &&
      status === "Paid"
    ) {
      const lastDue = new Date(inst.dueDate);
      for (let i = 1; i <= 12; i++) {
        const nextDue = new Date(lastDue);
        nextDue.setMonth(nextDue.getMonth() + i);
        cd.installments.push({
          monthNo: cd.installments.length + 1,
          dueDate: nextDue,
          amount: cd.monthlyDeposit,
          status: "Pending",
        });
      }
    }

    await cd.save();
    res.json(cd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Partial Withdrawal -------------------
export const withdrawFromCD = async (req, res) => {
  try {
    const { cdId } = req.params;
    const { amount, reason, clerkId } = req.body;

    const cd = await CD.findById(cdId);
    if (!cd) return res.status(404).json({ error: "CD not found" });
    if (cd.status !== "Active")
      return res.status(400).json({ error: "CD account not active" });

    const oneThirdLimit = cd.totalDeposited / 3;
    const totalAllowed = reason === "Resignation" ? cd.balance : oneThirdLimit;

    if (amount > totalAllowed)
      return res.status(400).json({
        error:
          reason === "Resignation"
            ? "Cannot withdraw more than total balance."
            : `You can withdraw up to ₹${oneThirdLimit.toFixed(2)} only.`,
      });

    cd.totalWithdrawn += amount;
    cd.balance -= amount;

    cd.transactions.push({
      type: "Withdrawal",
      amount,
      date: new Date(),
      reason,
      clerkId,
    });

    await cd.save();
    res.json(cd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Apply Dividend -------------------
export const applyDividend = async (req, res) => {
  try {
    const { cdId } = req.params;
    const { dividendRate, clerkId } = req.body;

    const cd = await CD.findById(cdId);
    if (!cd) return res.status(404).json({ error: "CD not found" });

    cd.dividendRate = dividendRate;
    const interestAmount = (cd.totalDeposited * dividendRate) / 100;
    cd.balance += interestAmount;

    cd.transactions.push({
      type: "Dividend",
      amount: interestAmount,
      date: new Date(),
      notes: `Dividend applied at ${dividendRate}%`,
      clerkId,
    });

    await cd.save();
    res.json(cd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Close CD -------------------
export const closeCD = async (req, res) => {
  try {
    const { cdId } = req.params;
    const { clerkId } = req.body;

    const cd = await CD.findById(cdId);
    if (!cd) return res.status(404).json({ error: "CD not found" });
    if (cd.status === "Closed")
      return res.status(400).json({ error: "CD already closed" });

    const finalAmount = cd.balance;

    cd.transactions.push({
      type: "Withdrawal",
      amount: finalAmount,
      date: new Date(),
      reason: "Final Settlement on Resignation/Closure",
      clerkId,
    });

    cd.totalWithdrawn += finalAmount;
    cd.balance = 0;
    cd.status = "Closed";
    cd.closedAt = new Date();

    await cd.save();
    res.json(cd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Delete CD -------------------
export const deleteCD = async (req, res) => {
  try {
    const { cdId } = req.params;
    const cd = await CD.findByIdAndDelete(cdId);
    if (!cd) return res.status(404).json({ error: "CD not found" });
    res.json({ message: "CD deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
