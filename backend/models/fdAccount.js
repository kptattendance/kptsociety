import mongoose from "mongoose";
const { Schema } = mongoose;

// ----------------------------- FD Schema -----------------------------
const FDSchema = new Schema(
  {
    fdNumber: { type: String, required: true, unique: true, trim: true },
    accountNumber: { type: String, required: true, unique: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    clerkId: { type: String },
    principal: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    startDate: { type: Date, required: true },
    maturityDate: { type: Date, required: true },
    compoundingFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "annually"],
      default: "monthly",
    },
    payoutFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "maturity"],
      default: "maturity",
    },
    autoRenew: { type: Boolean, default: false },
    preclosureAllowed: { type: Boolean, default: true },
    preclosurePenaltyPercent: { type: Number, default: 1.0 },
    maturityAmount: { type: Number, default: 0 },
    lastInterestPostedAt: { type: Date },
    status: {
      type: String,
      enum: ["Active", "Matured", "PreClosed", "Closed"],
      default: "Active",
    },
    notes: { type: String },

    // ---------------------- Withdrawals ----------------------
    withdrawals: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        reason: { type: String },
        chequeNumber: { type: String },
        chequeDate: { type: Date },
        paymentMode: {
          type: String,
          enum: ["Cash", "Cheque", "Online"],
          default: "Cash",
        },
        clerkId: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
FDSchema.index({ memberId: 1, accountNumber: 1 });
FDSchema.index({ startDate: -1 });
FDSchema.index({ fdNumber: 1 }, { unique: true });

const FD = mongoose.model("FD", FDSchema);
export default FD;
