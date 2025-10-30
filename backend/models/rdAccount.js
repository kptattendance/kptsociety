import mongoose from "mongoose";
const { Schema } = mongoose;

// ---------------------- RD Installment (per-month) ----------------------
const RDInstallmentSchema = new Schema(
  {
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Missed"],
      default: "Pending",
    },
    paymentMode: { type: String }, // cash / cheque / online
    reference: { type: String }, // txn reference / cheque no
    notes: { type: String },
  },
  { _id: false }
);

// ----------------------------- RD Schema -----------------------------
// ---------------------- RD Withdrawal (per withdrawal) ----------------------
const RDWithdrawalSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    chequeNumber: { type: String },
    chequeDate: { type: Date },
    withdrawnAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { _id: false }
);

// ----------------------------- RD Schema -----------------------------
const RDSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, required: true, unique: true },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    clerkId: { type: String },

    initialDeposit: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    initialDepositDate: { type: Date },
    depositAmount: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true },

    startDate: { type: Date, required: true },
    maturityDate: { type: Date, required: true },

    totalDeposited: { type: Number, default: 0 },
    maturityAmount: { type: Number, default: 0 },

    installments: { type: [RDInstallmentSchema], default: [] },

    withdrawals: { type: [RDWithdrawalSchema], default: [] }, // <-- NEW FIELD

    dueDayOfMonth: { type: Number },
    gracePeriodDays: { type: Number, default: 7 },
    lateFeePerInstallment: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Active", "Matured", "Closed", "PreClosed", "Defaulted"],
      default: "Active",
    },

    notes: { type: String },
  },
  { timestamps: true }
);

// Index for quick lookups
RDSchema.index({ memberId: 1, accountNumber: 1 });
RDSchema.index({ startDate: -1 });
const RD = mongoose.model("RD", RDSchema);
export default RD;
