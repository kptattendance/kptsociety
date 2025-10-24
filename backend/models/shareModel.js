import mongoose from "mongoose";

// 🟢 Each purchase has its own independent date
const purchaseSchema = new mongoose.Schema({
  purchaseDate: { type: Date, default: Date.now }, // renamed from 'date'
  sharesBought: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  paymentMode: String,
  reference: String,
  notes: String,
});

// 🟢 Withdrawal remains same (has independent date)
const withdrawalSchema = new mongoose.Schema({
  withdrawalDate: { type: Date, default: Date.now }, // renamed from 'date' for clarity
  sharesReturned: { type: Number, default: 0 },
  amountPaidOut: { type: Number, default: 0 },
  paymentMode: String,
  chequeNumber: String,
  reference: String,
  processedBy: String,
  notes: String,
  remainingShares: Number,
  remainingAmount: Number,
});

const shareSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    clerkId: { type: String, required: true },

    // Society assigned share/account number
    societyShareNumber: { type: String, default: null },

    // Account opening date (doesn't change per purchase)
    accountStartDate: { type: Date, default: Date.now },

    totalSharesPurchased: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // Current active balances after withdrawals
    currentSharesBalance: { type: Number, default: 0 },
    currentAmountBalance: { type: Number, default: 0 },

    sharePrice: { type: Number, default: 100 },
    processingFee: { type: Number, default: 0 },

    // 🟢 updated field names to clearly separate purchase and withdrawal
    purchaseHistory: [purchaseSchema],
    withdrawalHistory: [withdrawalSchema],

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    closedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("ShareAccount", shareSchema);
