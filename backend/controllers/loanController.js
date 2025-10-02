import Loan from "../models/loanModel.js";
import Member from "../models/memberModel.js";

// -------------------- GENERATE REPAYMENT SCHEDULE --------------------
export const generateRepaymentSchedule = (
  loanAmount,
  interestRate,
  tenureMonths,
  startDate
) => {
  const monthlyRate = interestRate / 12 / 100; // monthly interest rate
  const emi =
    (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenureMonths));
  let outstanding = loanAmount;

  const schedule = [];

  const start = new Date(startDate); // use passed startDate exactly

  for (let i = 0; i < tenureMonths; i++) {
    const interest = outstanding * monthlyRate;
    const principal = emi - interest;
    outstanding -= principal;

    // compute due date by adding i months to the exact start date
    const dueDate = new Date(start);
    dueDate.setMonth(start.getMonth() + i + 1);

    schedule.push({
      dueDate,
      principal: parseFloat(principal.toFixed(2)),
      interest: parseFloat(interest.toFixed(2)),
      totalEMI: parseFloat(emi.toFixed(2)),
      scheduleOS: parseFloat(outstanding.toFixed(2)),
      status: "Pending",
    });
  }

  return schedule;
};

// -------------------- CREATE LOAN (manual appliedAt) --------------------
export const createLoan = async (req, res) => {
  try {
    const {
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
      appliedAt, // manual loan creation date
    } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const member = await Member.findOne({ email });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const schedule = generateRepaymentSchedule(
      loanAmount,
      interestRate,
      tenure,
      appliedAt || new Date()
    );

    const loan = new Loan({
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
      appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
      repayments: schedule,
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
      (f) => updates[f] !== undefined
    );

    if (shouldRegenerateSchedule) {
      const loanAmount = updates.loanAmount || loan.loanAmount;
      const interestRate = updates.interestRate || loan.interestRate;
      const tenure = updates.tenure || loan.tenure;
      const startDate =
        updates.startDate || (loan.repayments[0]?.dueDate ?? new Date());

      loan.repayments = generateRepaymentSchedule(
        loanAmount,
        interestRate,
        tenure,
        startDate
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
    const { id } = req.params; // clerkId or Mongo _id
    let loan;

    loan = await Loan.findOne({ clerkId: id }).populate("memberId");
    if (!loan) loan = await Loan.findById(id).populate("memberId");

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
    const { loanId, installmentNo } = req.params; // installmentNo is 1-based index
    const loan = await Loan.findById(loanId);
    console.log(loan);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const index = parseInt(installmentNo, 10) - 1;
    if (!loan.repayments[index])
      return res.status(400).json({ message: "Installment not found" });

    loan.repayments[index].status = "Paid";
    await loan.save();

    res.json({
      message: `Installment #${installmentNo} marked as Paid`,
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

/** * Helper: add months to a date */

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function safeNumber(val) {
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? 0 : Number(num.toFixed(2));
}

export function recalculateScheduleWithPrepayment(
  loan,
  amount,
  mode,
  installment
) {
  const repayments = loan.repayments;
  const monthlyRate = loan.interestRate / 12 / 100;
  const currentInstallment = Number(installment);

  // Validate selected installment
  if (!repayments[currentInstallment - 1]) {
    throw new Error("Invalid installment selected for prepayment");
  }

  // Outstanding principal at selected installment
  let outstanding = repayments[currentInstallment - 1].scheduleOS;
  outstanding -= Number(amount);
  if (outstanding < 0) outstanding = 0;

  // --- CASE 1: Reduce Tenure (keep EMI same) ---
  if (mode === "reduceTenure") {
    // Calculate original EMI from loan amount, tenure, and rate
    const emi =
      (loan.loanAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -loan.tenure));

    let newRepayments = [];
    let i = currentInstallment;
    const baseDate = repayments[currentInstallment - 1].dueDate;

    while (outstanding > 0) {
      const interest = outstanding * monthlyRate;
      let principalPart = emi - interest;
      if (principalPart > outstanding) principalPart = outstanding;
      outstanding -= principalPart;

      newRepayments.push({
        installmentNo: i + 1,
        dueDate: addMonths(new Date(baseDate), i - currentInstallment + 1),
        principal: Number(principalPart.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        totalEMI: Number((principalPart + interest).toFixed(2)),
        scheduleOS: Number(outstanding.toFixed(2)),
        status: "Pending",
      });

      i++;
    }

    return {
      repayments: [
        ...repayments.slice(0, currentInstallment),
        ...newRepayments,
      ],
    };
  }

  // --- CASE 2: Reduce EMI (keep tenure same) ---
  if (mode === "reduceEMI") {
    const remainingTenure = loan.tenure - currentInstallment;
    if (remainingTenure <= 0) return { repayments };

    const emi =
      (outstanding * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -remainingTenure));

    let newRepayments = [];
    let i = currentInstallment;
    const baseDate = repayments[currentInstallment - 1].dueDate;

    while (outstanding > 0 && i < loan.tenure) {
      const interest = outstanding * monthlyRate;
      let principalPart = emi - interest;
      if (principalPart > outstanding) principalPart = outstanding;
      outstanding -= principalPart;

      newRepayments.push({
        installmentNo: i + 1,
        dueDate: addMonths(new Date(baseDate), i - currentInstallment + 1),
        principal: Number(principalPart.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        totalEMI: Number((principalPart + interest).toFixed(2)),
        scheduleOS: Number(outstanding.toFixed(2)),
        status: "Pending",
      });

      i++;
    }

    return {
      repayments: [
        ...repayments.slice(0, currentInstallment),
        ...newRepayments,
      ],
    };
  }

  throw new Error("Invalid prepayment mode");
}

export const recalculatedSchedule = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount, mode, installment } = req.body;

    // Input validations
    if (!loanId)
      return res.status(400).json({ message: "Loan ID is required" });
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Prepayment amount must be > 0" });
    if (!["reduceTenure", "reduceEMI"].includes(mode))
      return res.status(400).json({ message: "Invalid prepayment mode" });

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (!installment || installment < 1 || installment > loan.repayments.length)
      return res.status(400).json({ message: "Invalid installment number" });

    // Recalculate schedule
    const updated = recalculateScheduleWithPrepayment(
      loan,
      amount,
      mode,
      installment
    );

    if (!updated?.repayments)
      return res
        .status(500)
        .json({ message: "Failed to recalculate schedule" });

    // ✅ Save updated repayments
    loan.repayments = updated.repayments;

    // ✅ Record lump-sum prepayment history
    loan.lumpSumPayments.push({
      amount: Number(amount),
      installment: Number(installment),
      mode,
    });

    await loan.save();

    return res.json({
      message: "Prepayment applied successfully",
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
