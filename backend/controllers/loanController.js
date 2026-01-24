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
        updates.startDate || (loan.repayments[0]?.dueDate ?? new Date());

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
    const { dueDate } = req.body; // ✅ get optional dueDate

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    const index = parseInt(installmentNo, 10) - 1;
    if (!loan.repayments[index])
      return res.status(400).json({ message: "Installment not found" });

    // ✅ If a due date is sent, update it
    if (dueDate) {
      loan.repayments[index].dueDate = new Date(dueDate);
    }

    // ✅ Mark as paid
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

function safeNumber(val) {
  const num = Number(val);
  return isNaN(num) || !isFinite(num) ? 0 : Number(num.toFixed(2));
}

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

// -------------------- GENERATE REPAYMENT SCHEDULE --------------------
export const generateRepaymentSchedule = (
  loanAmount,
  interestRate,
  tenureMonths,
  startDate,
) => {
  const monthlyRate = interestRate / 12 / 100; // Monthly interest rate
  const emi =
    (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenureMonths));

  let outstanding = loanAmount;
  const schedule = [];
  const start = new Date(startDate);

  for (let i = 0; i < tenureMonths; i++) {
    const interest = outstanding * monthlyRate;
    const principal = emi - interest;
    outstanding -= principal;

    // Clamp for floating precision issues
    outstanding = Math.max(0, Number(outstanding.toFixed(2)));

    // Use safe date addition
    const dueDate = addMonths(start, i + 1);

    schedule.push({
      dueDate,
      principal: Number(principal.toFixed(2)),
      interest: Number(interest.toFixed(2)),
      totalEMI: Number(emi.toFixed(2)),
      scheduleOS: Number(outstanding.toFixed(2)),
      status: "Pending",
    });
  }

  return schedule;
};

export function recalculateScheduleWithPrepayment(
  loan,
  amount,
  mode,
  installment,
) {
  const repayments = loan.repayments;
  const monthlyRate = loan.interestRate / 12 / 100;
  const currentInstallment = Number(installment);

  if (!repayments[currentInstallment - 1]) {
    throw new Error("Invalid installment selected for prepayment");
  }

  // Outstanding after the selected installment
  let outstanding =
    repayments[currentInstallment - 1].scheduleOS - Number(amount);
  outstanding = Math.max(0, Number(outstanding.toFixed(2)));

  const baseDate = repayments[currentInstallment - 1].dueDate;

  // --- CASE 1: Reduce Tenure (keep EMI constant) ---
  if (mode === "reduceTenure") {
    // Use current EMI (not recalculated from loanAmount)
    const emi = repayments[0].totalEMI;
    const newRepayments = [];
    let i = currentInstallment;

    while (outstanding > 0) {
      const interest = outstanding * monthlyRate;
      let principal = emi - interest;
      if (principal > outstanding) principal = outstanding;

      outstanding -= principal;
      outstanding = Math.max(0, Number(outstanding.toFixed(2)));

      newRepayments.push({
        installmentNo: i + 1,
        dueDate: addMonths(new Date(baseDate), i - currentInstallment + 1),
        principal: Number(principal.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        totalEMI: Number((principal + interest).toFixed(2)),
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

  // --- CASE 2: Reduce EMI (keep tenure constant) ---
  if (mode === "reduceEMI") {
    const remainingTenure = loan.tenure - currentInstallment;
    if (remainingTenure <= 0) return { repayments };

    // Recalculate EMI for remaining tenure
    const emi =
      (outstanding * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -remainingTenure));

    const newRepayments = [];
    let i = currentInstallment;

    while (outstanding > 0 && i < loan.tenure) {
      const interest = outstanding * monthlyRate;
      let principal = emi - interest;
      if (principal > outstanding) principal = outstanding;

      outstanding -= principal;
      outstanding = Math.max(0, Number(outstanding.toFixed(2)));

      newRepayments.push({
        installmentNo: i + 1,
        dueDate: addMonths(new Date(baseDate), i - currentInstallment + 1),
        principal: Number(principal.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        totalEMI: Number((principal + interest).toFixed(2)),
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
      installment,
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
