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
    const loans = await Loan.find()
      .populate("memberId", "name email role phone photo")
      .lean();
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
    // The admin screen sends the loan _id – look that up first
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    let loan = isObjectId
      ? await Loan.findById(id).populate("memberId", "name email photo phone").lean()
      : null;
    if (!loan)
      loan = await Loan.findOne({ clerkId: id })
        .populate("memberId", "name email photo phone")
        .lean();
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

    // Part payments are placed by date, so a changed due date can move one
    if (dueDate && loan.lumpSumPayments?.length) {
      try {
        applyRebuild(loan, loan.lumpSumPayments.map((p) => p.toObject()));
      } catch (e) {
        if (e.status) return res.status(400).json({ message: e.message });
        throw e;
      }
    }
    await loan.save();

    res.json({
      message: `Installment #${installmentNo} marked as ${status}`,
      repayment: loan.repayments[index],
      loan,
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

// Day number (local date only) so a payment on the due date falls in that installment
const dayOf = (d) => {
  const x = new Date(d);
  return Math.floor(
    Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / 86400000,
  );
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB");

// Months needed to clear `balance` at `emi`
function monthsToClear(balance, monthlyRate, emi) {
  let bal = round2(balance);
  let n = 0;
  while (bal > 0 && n < 1200) {
    const principal = round2(emi - round2(bal * monthlyRate));
    if (principal <= 0) return 1200;
    bal = round2(bal - principal);
    n++;
  }
  return n;
}

/**
 * Rebuilds the whole repayment schedule from the loan terms and the list of
 * part payments, the same way the society's EMI sheet works:
 *  - every row is one monthly installment; interest = opening balance × rate
 *  - a part payment belongs to the first installment due on/after its date
 *    and is deducted after that row's principal:
 *      balance = opening − principal − part payments
 *  - "reduceTenure" keeps the EMI (loan ends earlier),
 *    "reduceEMI" keeps the end date (EMI is recalculated).
 * Paid status and due dates of existing rows are kept by row number.
 * Because everything is recomputed, any part payment can be added or deleted.
 */
export function rebuildSchedule(loan, lumpSums = loan.lumpSumPayments || []) {
  const monthlyRate = Number(loan.interestRate) / 12 / 100;
  const tenure = Number(loan.tenure);
  const existing = loan.repayments || [];

  // Oldest payment first; same-day payments keep the order they were entered
  const lumps = lumpSums
    .map((p, i) => ({ p: p.toObject ? p.toObject() : { ...p }, i }))
    .sort((a, b) => dayOf(a.p.paidAt) - dayOf(b.p.paidAt) || a.i - b.i)
    .map((x) => x.p);

  let emi = round2(calcEMI(Number(loan.loanAmount), monthlyRate, tenure));
  let plannedEnd = tenure; // null = run until cleared at the current EMI
  let balance = round2(loan.loanAmount);
  let prevDate = new Date(loan.startDate);
  let li = 0;
  let closedBy = null; // part payment that cleared the loan
  const rows = [];

  const monthsLeft = (k, bal) =>
    plannedEnd
      ? Math.max(plannedEnd - k, 1)
      : monthsToClear(bal, monthlyRate, emi);

  for (let k = 1; balance > 0 && k <= 1200; k++) {
    const old = existing[k - 1];
    const dueDate = old?.dueDate
      ? new Date(old.dueDate)
      : addMonths(prevDate, 1);
    prevDate = dueDate;

    const opening = balance;
    let interest = round2(opening * monthlyRate);
    let principal = round2(emi - interest);
    const isLast =
      (plannedEnd && k >= plannedEnd) || principal >= opening || principal <= 0;
    if (isLast) principal = opening;

    let bal = round2(opening - principal);

    // Part payments made up to this installment's due date
    while (li < lumps.length && dayOf(lumps[li].paidAt) <= dayOf(dueDate)) {
      const p = lumps[li++];
      const amount = round2(p.amount);
      const emiBefore = emi;
      const before = bal; // balance after this row's EMI
      const leftBefore = bal > 0 ? monthsLeft(k, bal) : 0;

      if (amount > bal) {
        // Settles the loan: the part payment also covers this row's principal
        const excess = round2(amount - bal);
        if (excess > principal + 0.005) {
          const err = new Error(
            `Part payment of ₹${amount} on ${fmtDate(p.paidAt)} is more than the balance ₹${round2(bal + principal)} at that time.`,
          );
          err.status = 400;
          throw err;
        }
        principal = round2(principal - excess);
        if (principal <= 0) {
          principal = 0;
          interest = 0; // settled before this EMI fell due
        }
        bal = 0;
      } else {
        bal = round2(bal - amount);
      }

      if (bal > 0) {
        if (p.mode === "reduceEMI") {
          emi = round2(calcEMI(bal, monthlyRate, leftBefore));
          plannedEnd = k + leftBefore;
        } else {
          plannedEnd = null;
        }
      } else if (!closedBy) {
        closedBy = p;
      }

      Object.assign(p, {
        installment: k, // internal only: the row it falls in
        outstandingBefore: amount > before ? round2(before + amount - bal) : before,
        outstandingAfter: bal,
        emiBefore,
        emiAfter: bal > 0 ? emi : 0,
        installmentsLeftBefore: leftBefore,
        installmentsLeftAfter: bal > 0 ? monthsLeft(k, bal) : 0,
      });
    }

    rows.push({
      ...(old?._id ? { _id: old._id } : {}),
      dueDate,
      principal,
      interest,
      totalEMI: round2(principal + interest),
      scheduleOS: bal,
      status: old?.status || "Pending",
    });
    balance = bal;
  }

  if (li < lumps.length) {
    const err = new Error(
      `Part payment on ${fmtDate(lumps[li].paidAt)} is after the loan was already fully repaid.`,
    );
    err.status = 400;
    throw err;
  }

  return { repayments: rows, lumpSumPayments: lumps, closedBy };
}

const LUMP_CLOSE_REASON = "Fully repaid by lump-sum payment";

// Rebuilds the schedule onto the loan, closing / reopening it as needed
function applyRebuild(loan, lumpSums) {
  const result = rebuildSchedule(loan, lumpSums);
  loan.repayments = result.repayments;
  loan.lumpSumPayments = result.lumpSumPayments;

  if (result.closedBy) {
    loan.loanStatus = "Closed";
    loan.closedAt = result.closedBy.paidAt;
    loan.closureReason = LUMP_CLOSE_REASON;
  } else if (
    loan.loanStatus === "Closed" &&
    loan.closureReason === LUMP_CLOSE_REASON
  ) {
    loan.loanStatus = "Active";
    loan.closedAt = undefined;
    loan.closureReason = undefined;
  }
  return result;
}

const pendingCount = (rows) => rows.filter((r) => r.status !== "Paid").length;

// -------------------- LUMP-SUM / PARTIAL PREPAYMENT --------------------
// Body: { amount, mode, paidAt?, note?, preview? }
// preview=true returns the effect without saving.
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

    const newLump = {
      amount: round2(amount),
      mode,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
      note,
    };
    const current = loan.lumpSumPayments.map((p) => p.toObject());

    let before, after;
    try {
      before = rebuildSchedule(loan, current);
      after = rebuildSchedule(loan, [...current, newLump]);
    } catch (e) {
      if (e.status) return res.status(400).json({ message: e.message });
      throw e;
    }

    const added = after.lumpSumPayments.find((p) => !p._id);
    const summary = {
      afterInstallment: added.installment,
      outstandingBefore: added.outstandingBefore,
      outstandingAfter: added.outstandingAfter,
      emiBefore: added.emiBefore,
      emiAfter: added.emiAfter,
      installmentsLeftBefore: pendingCount(before.repayments),
      installmentsLeftAfter: pendingCount(after.repayments),
      closesLoan: added.outstandingAfter === 0,
    };

    if (preview) return res.json({ preview: true, summary });

    applyRebuild(loan, [...current, newLump]);
    await loan.save();

    return res.json({
      message: summary.closesLoan
        ? "Payment applied – loan fully repaid and closed"
        : "Part payment saved",
      summary,
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

// -------------------- DELETE A LUMP-SUM PAYMENT --------------------
// Any part payment can be deleted; the schedule is rebuilt without it.
export const deleteLumpSum = async (req, res) => {
  try {
    const { loanId, paymentId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const remaining = loan.lumpSumPayments
      .filter((p) => String(p._id) !== paymentId)
      .map((p) => p.toObject());
    if (remaining.length === loan.lumpSumPayments.length)
      return res.status(404).json({ message: "Part payment not found" });

    try {
      applyRebuild(loan, remaining);
    } catch (e) {
      if (e.status) return res.status(400).json({ message: e.message });
      throw e;
    }
    await loan.save();

    return res.json({
      message: "Part payment deleted and schedule recalculated",
      loan,
    });
  } catch (error) {
    console.error("Delete Lump Sum Error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const closeLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { closedAt, reason } = req.body;


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
