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
const RDSchema = new Schema(
  {
    accountNumber: { type: String, required: true, unique: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    clerkId: { type: String },

    // Core product fields
    depositAmount: { type: Number, required: true }, // monthly installment
    tenureMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // annual % locked on opening

    // Dates
    startDate: { type: Date, required: true },
    maturityDate: { type: Date, required: true },

    // Derived / bookkeeping
    totalDeposited: { type: Number, default: 0 },
    maturityAmount: { type: Number, default: 0 }, // can be precomputed or computed on the fly

    // Payment schedule
    installments: { type: [RDInstallmentSchema], default: [] },

    // Policies
    dueDayOfMonth: { type: Number }, // e.g., 1..28 (helps schedule generation)
    gracePeriodDays: { type: Number, default: 7 },
    lateFeePerInstallment: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ["Active", "Matured", "Closed", "PreClosed", "Defaulted"],
      default: "Active",
    },

    // Misc
    notes: { type: String },
  },
  { timestamps: true }
);

// Index for quick lookups
RDSchema.index({ memberId: 1, accountNumber: 1 });
RDSchema.index({ startDate: -1 });
const RD = mongoose.model("RD", RDSchema);
export default RD;
