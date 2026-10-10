import Loan from "../models/loanModel.js";
import Member from "../models/memberModel.js";

// -------------------- CREATE LOAN --------------------
export const createLoan = async (req, res) => {
  try {
    const {
      loanAccountNumber,
      email,
      loanType,
      loanAmount,
      interestRate,
      tenure,
      loanPurpose,
      collateralType,
      collateralDetails,
      grossSalary,
      basicSalary,
      startDate,
      appliedAt,
      chequeNumber,
      chequeDate,
      chequeAmount,
    } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!startDate)
      return res.status(400).json({ message: "Loan start date is required" });

    const member = await Member.findOne({ email });
    if (!member) return res.status(404).json({ message: "Member not found" });

    // ✅ Generate schedule using user-provided startDate
    const schedule = generateRepaymentSchedule(
      loanAmount,
      interestRate,
      tenure,
      new Date(startDate),
    );

    const loan = new Loan({
      accountNumber: loanAccountNumber,
      memberId: member._id,
      clerkId: member.clerkId,
      loanType,
      loanAmount,
      interestRate,
      tenure,
      loanPurpose,
      collateralType,
      collateralDetails,
      grossSalary,
      basicSalary,
      startDate: new Date(startDate),
      appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
      repayments: schedule,
      chequeDetails: chequeNumber
        ? { chequeNumber, chequeDate, chequeAmount }
        : undefined, // optional if some loans are non-cheque based
    });

    await loan.save();
    res.status(201).json({ message: "Loan application created", loan });
  } catch (error) {
    console.error("Create Loan Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- UPDATE LOAN --------------------
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params; // Mongo _id or clerkId
    const updates = req.body;

    let loan = id.match(/^[0-9a-fA-F]{24}$/)
      ? await Loan.findById(id)
      : await Loan.findOne({ clerkId: id });

    if (!loan) return res.status(404).json({ message: "Loan not found" });

    // If any of the core loan fields change, regenerate repayment schedule
    const fieldsAffectSchedule = [
      "loanAmount",
      "interestRate",
      "tenure",
      "startDate",
    ];
    const shouldRegenerateSchedule = fieldsAffectSchedule.some(
      (f) => updates[f] !== undefined,
    );

    if (shouldRegenerateSchedule) {
      const loanAmount = updates.loanAmount || loan.loanAmount;
      const interestRate = updates.interestRate || loan.interestRate;
      const tenure = updates.tenure || loan.tenure;
      const startDate =
        updates.startDate || loan.startDate || new Date();

      loan.repayments = generateRepaymentSchedule(
        loanAmount,
        interestRate,
        tenure,
        startDate,
      );
    }

    // Apply other updates
    Object.assign(loan, updates);
    await loan.save();

    res.json({ message: "Loan updated successfully", loan });
  } catch (error) {
    console.error("Update Loan Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- GET ALL LOANS --------------------
export const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate("memberId", "name email role");
    res.json(loans);
  } catch (error) {
    console.error("Get Loans Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- GET SINGLE LOAN --------------------
export const getLoan = async (req, res) => {
  try {
    const { id } = req.params;

    // If clerkId → return ALL loans
    const loans = await Loan.find({ clerkId: id }).populate(
      "memberId",
      "name email photo phone",
    );

    if (loans.length > 0) {
      return res.json(loans);
    }

    // Else treat as Mongo _id (single loan view)
    const loan = await Loan.findById(id).populate(
      "memberId",
      "name email photo phone",
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    return res.json([loan]); // always return array
  } catch (error) {
    console.error("Get Loan Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const repaygetLoan = async (req, res) => {
  try {
    const { id } = req.params; // clerkId or Mongo _id
    let loan;

    loan = await Loan.findOne({ clerkId: id }).populate("memberId");
    if (!loan)
      loan = await Loan.findById(id).populate(
        "memberId",
        "name email photo phone",
      );
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    res.json(loan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- MARK REPAYMENT AS PAID --------------------
export const markRepaymentPaid = async (req, res) => {
  try {
    const { loanId, installmentNo } = req.params;
    const { dueDate, status = "Paid" } = req.body;
    if (!["Paid", "Pending"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const index = parseInt(installmentNo, 10) - 1;
    if (!loan.repayments[index])
      return res.status(400).json({ message: "Installment not found" });

    // ✅ If a due date is sent, update it
    if (dueDate) {
      loan.repayments[index].dueDate = new Date(dueDate);
    }

    loan.repayments[index].status = status;
    await loan.save();

    res.json({
      message: `Installment #${installmentNo} marked as ${status}`,
      repayment: loan.repayments[index],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// -------------------- DELETE LOAN --------------------
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    let loan = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) loan = await Loan.findById(id);
    if (!loan) loan = await Loan.findOne({ clerkId: id });
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    await loan.deleteOne();
    res.json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Delete Loan Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// ✅ Safe Month Addition Helper
function addMonths(date, count) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + count);

  // Handle month overflow (e.g., Jan 31 → Feb 28)
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
}

// EMI for a balance over N months
function calcEMI(principal, monthlyRate, months) {
  if (months <= 0) return principal;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

/**
 * Builds installments from a starting balance.
 * - If `months` is given, the schedule runs exactly that many months.
 * - Otherwise it runs until the balance is cleared at the given EMI.
 * The last installment always absorbs rounding so the balance ends at exactly 0.
 */
function buildInstallments({ balance, monthlyRate, emi, months, baseDate }) {
  const rows = [];
  let outstanding = round2(balance);
  const MAX_ROWS = 1200; // safety guard against an endless loop

  for (let k = 1; outstanding > 0 && rows.length < MAX_ROWS; k++) {
    const interest = round2(outstanding * monthlyRate);
    let principal = round2(emi - interest);

    const isLast =
      (months && k >= months) || principal >= outstanding || principal <= 0;
    if (isLast) principal = outstanding;

    outstanding = round2(outstanding - principal);

    rows.push({
      dueDate: addMonths(baseDate, k),
      principal,
      interest,
      totalEMI: round2(principal + interest),
      scheduleOS: outstanding,
      status: "Pending",
    });

    if (isLast) break;
  }
  return rows;
}

// -------------------- GENERATE REPAYMENT SCHEDULE --------------------
export const generateRepaymentSchedule = (
  loanAmount,
  interestRate,
  tenureMonths,
  startDate,
) => {
  const monthlyRate = Number(interestRate) / 12 / 100;
  const months = Number(tenureMonths);
  const emi = round2(calcEMI(Number(loanAmount), monthlyRate, months));
  return buildInstallments({
    balance: Number(loanAmount),
    monthlyRate,
    emi,
    months,
    baseDate: new Date(startDate),
  });
};

/**
 * Where the loan stands right now.
 * Paid installments must be continuous from #1 – the prepayment is applied
 * right after the last paid installment.
 */
export function getLoanPosition(loan) {
  const reps = loan.repayments || [];
  let lastPaid = 0;
  while (lastPaid < reps.length && reps[lastPaid].status === "Paid") lastPaid++;

  const paidLater = reps.slice(lastPaid).some((r) => r.status === "Paid");

  // Opening balance of the next pending installment = its principal + balance after it.
  // This already includes every lump sum paid so far (even several after the same EMI).
  const next = reps[lastPaid];
  const outstanding = next
    ? Number(next.principal) + Number(next.scheduleOS)
    : 0;
  return {
    lastPaid, // number of installments paid (0 = none yet)
    paidLater, // true if there's a gap (e.g. #3 paid but #2 pending)
    outstanding: round2(outstanding),
    currentEMI: next ? next.totalEMI : 0,
    installmentsLeft: reps.length - lastPaid,
    baseDate: lastPaid === 0 ? new Date(loan.startDate) : reps[lastPaid - 1].dueDate,
  };
}

export function recalculateScheduleWithPrepayment(loan, amount, mode) {
  const reps = loan.repayments;
  const monthlyRate = Number(loan.interestRate) / 12 / 100;
  const pos = getLoanPosition(loan);
  const amt = round2(amount);

  if (pos.paidLater) {
    throw new Error(
      "Installments are marked Paid out of order. Mark all earlier installments Paid first.",
    );
  }
  if (pos.outstanding <= 0) throw new Error("This loan has no outstanding balance.");
  if (amt > pos.outstanding) {
    throw new Error(
      `Amount ₹${amt} is more than the outstanding balance ₹${pos.outstanding}.`,
    );
  }

  const newBalance = round2(pos.outstanding - amt);
  const kept = reps.slice(0, pos.lastPaid);

  let futureRows = [];
  if (newBalance > 0) {
    if (mode === "reduceTenure") {
      // Same EMI as now, fewer months
      futureRows = buildInstallments({
        balance: newBalance,
        monthlyRate,
        emi: pos.currentEMI,
        baseDate: pos.baseDate,
      });
    } else if (mode === "reduceEMI") {
      // Same number of months left, smaller EMI
      const months = pos.installmentsLeft;
      futureRows = buildInstallments({
        balance: newBalance,
        monthlyRate,
        emi: round2(calcEMI(newBalance, monthlyRate, months)),
        months,
        baseDate: pos.baseDate,
      });
    } else {
      throw new Error("Invalid prepayment mode");
    }
  }

  return {
    repayments: [...kept, ...futureRows],
    summary: {
      afterInstallment: pos.lastPaid,
      outstandingBefore: pos.outstanding,
      outstandingAfter: newBalance,
      emiBefore: pos.currentEMI,
      emiAfter: futureRows[0]?.totalEMI ?? 0,
      installmentsLeftBefore: pos.installmentsLeft,
      installmentsLeftAfter: futureRows.length,
      closesLoan: newBalance === 0,
    },
  };
}

// -------------------- LUMP-SUM / PARTIAL PREPAYMENT --------------------
// Body: { amount, mode, paidAt?, note?, preview? }
// preview=true returns the new schedule without saving.
export const recalculatedSchedule = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount, mode, paidAt, note, preview } = req.body;

    if (!amount || Number(amount) <= 0)
      return res.status(400).json({ message: "Prepayment amount must be > 0" });
    if (!["reduceTenure", "reduceEMI"].includes(mode))
      return res.status(400).json({ message: "Invalid prepayment mode" });

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (loan.loanStatus === "Closed")
      return res.status(400).json({ message: "Loan is already closed" });

    let updated;
    try {
      updated = recalculateScheduleWithPrepayment(loan, amount, mode);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    if (preview) {
      return res.json({ preview: true, ...updated });
    }

    loan.repayments = updated.repayments;
    const s = updated.summary;
    loan.lumpSumPayments.push({
      amount: round2(amount),
      installment: s.afterInstallment,
      mode,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      outstandingBefore: s.outstandingBefore,
      outstandingAfter: s.outstandingAfter,
      emiBefore: s.emiBefore,
      emiAfter: s.emiAfter,
      installmentsLeftBefore: s.installmentsLeftBefore,
      installmentsLeftAfter: s.installmentsLeftAfter,
      note,
    });

    if (s.closesLoan) {
      loan.loanStatus = "Closed";
      loan.closedAt = paidAt ? new Date(paidAt) : new Date();
      loan.closureReason = "Fully repaid by lump-sum payment";
    }

    await loan.save();

    return res.json({
      message: s.closesLoan
        ? "Payment applied – loan fully repaid and closed"
        : "Prepayment applied successfully",
      summary: s,
      loan,
    });
  } catch (error) {
    console.error("Error in recalculatedSchedule:", error);
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
};

export const closeLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { closedAt, reason } = req.body;

    console.log("Loan ID:", id);
    console.log("Closed Date:", closedAt);
    console.log("Reason:", reason);

    const loan = await Loan.findById(id);

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    loan.loanStatus = "Closed";
    loan.closedAt = closedAt;
    loan.closureReason = reason;

    await loan.save();

    console.log("Loan closed successfully");

    res.json({
      message: "Loan closed successfully",
      loan,
    });
  } catch (error) {
    console.error("Close Loan Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
