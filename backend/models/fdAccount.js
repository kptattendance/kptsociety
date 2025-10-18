import mongoose from "mongoose";
const { Schema } = mongoose;

// ----------------------------- FD Schema -----------------------------
const FDSchema = new Schema(
  {
    // Society-given FD Number
    fdNumber: { type: String, required: true, unique: true, trim: true },

    accountNumber: { type: String, required: true, unique: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    clerkId: { type: String },

    // Core product fields
    principal: { type: Number, required: true },
    tenureMonths: { type: Number, required: true }, // Input in months
    interestRate: { type: Number, required: true }, // annual % locked on opening

    // Dates
    startDate: { type: Date, required: true },
    maturityDate: { type: Date, required: true },

    // Interest & payout
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

    // Auto renew on maturity
    autoRenew: { type: Boolean, default: false },

    // Preclosure / penalty
    preclosureAllowed: { type: Boolean, default: true },
    preclosurePenaltyPercent: { type: Number, default: 1.0 },

    // Derived values
    maturityAmount: { type: Number, default: 0 },
    lastInterestPostedAt: { type: Date },

    // Status
    status: {
      type: String,
      enum: ["Active", "Matured", "PreClosed", "Closed"],
      default: "Active",
    },

    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes
FDSchema.index({ memberId: 1, accountNumber: 1 });
FDSchema.index({ startDate: -1 });
FDSchema.index({ fdNumber: 1 }, { unique: true });

// ----------------------------- Export -----------------------------
const FD = mongoose.model("FD", FDSchema);
export default FD;
