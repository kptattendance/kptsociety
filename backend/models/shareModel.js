// models/shareModel.js
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  sharesBought: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  paymentMode: String,
  reference: String, // e.g., cheque number / txn id
  notes: String,
});

const withdrawalSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  sharesReturned: { type: Number, default: 0 }, // if withdrawal is share-based
  amountPaidOut: { type: Number, default: 0 }, // actual amount paid to member
  paymentMode: String, // e.g., "Cheque"
  chequeNumber: String,
  reference: String,
  processedBy: String, // clerk id who processed withdrawal
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

    // New: society assigned share/account number (string to allow prefixes)
    societyShareNumber: { type: String, default: null },

    // New: start date manually set when opening share account
    accountStartDate: { type: Date, default: Date.now },

    totalSharesPurchased: { type: Number, default: 0 }, // total ever purchased
    totalAmount: { type: Number, default: 0 }, // total ever paid in purchases

    // Current (active) balances after withdrawals
    currentSharesBalance: { type: Number, default: 0 },
    currentAmountBalance: { type: Number, default: 0 },

    sharePrice: { type: Number, default: 100 },
    // ✅ add this
    processingFee: { type: Number, default: 0 },
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
