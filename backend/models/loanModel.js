import mongoose from "mongoose";

const LumpSumSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  installment: { type: Number, required: true },
  mode: { type: String, enum: ["reduceTenure", "reduceEMI"], required: true },
  paidAt: { type: Date, default: Date.now },
});

const RepaymentSchema = new mongoose.Schema({
  dueDate: Date,
  principal: Number,
  interest: Number,
  totalEMI: Number,
  scheduleOS: Number,
  status: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending",
  },
});

const ChequeDetailsSchema = new mongoose.Schema({
  chequeNumber: { type: String, required: true },
  chequeDate: { type: Date, required: true },
  chequeAmount: { type: Number, required: true },
});

const loanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    accountNumber: { type: String, unique: true, required: true },

    clerkId: { type: String, required: true },
    loanType: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenure: { type: Number, required: true },
    loanPurpose: { type: String },
    collateralType: { type: String },
    collateralDetails: { type: String },
    grossSalary: { type: Number, required: true },
    basicSalary: { type: Number, required: true },

    // ✅ Loan start date (must come from frontend)
    startDate: { type: Date, required: true },

    appliedAt: { type: Date, default: Date.now },
    repayments: [RepaymentSchema],
    lumpSumPayments: [LumpSumSchema],
    chequeDetails: ChequeDetailsSchema,

    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
