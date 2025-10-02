import mongoose from "mongoose";

const LumpSumSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  installment: { type: Number, required: true },
  mode: { type: String, enum: ["reduceTenure", "reduceEMI"], required: true },
  paidAt: { type: Date, default: Date.now },
});

const RepaymentSchema = new mongoose.Schema({
  dueDate: Date, // e.g., "2025-10-10"
  principal: Number, // EMI principal portion
  interest: Number, // EMI interest portion
  totalEMI: Number, // principal + interest
  scheduleOS: Number, // outstanding principal after this payment
  status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
});

const loanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    clerkId: { type: String, required: true }, // Clerk ID for reference
    loanType: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenure: { type: Number, required: true },
    loanPurpose: { type: String },
    collateralType: { type: String },
    collateralDetails: { type: String },
    grossSalary: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    appliedAt: { type: Date, default: Date.now },
    repayments: [RepaymentSchema],
    lumpSumPayments: [LumpSumSchema],
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
