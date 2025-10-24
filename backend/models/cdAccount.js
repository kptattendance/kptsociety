import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
  monthNo: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  paidAt: { type: Date },
  clerkId: { type: String },
});

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Deposit", "Withdrawal", "Dividend"],
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  reason: { type: String },
  chequeNumber: { type: String },
  chequeDate: { type: Date },
  paymentMode: { type: String },
  reference: { type: String },
  notes: { type: String },
  clerkId: { type: String },
});

const cdAccountSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, unique: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    clerkId: { type: String },
    startDate: { type: Date, required: true },
    monthlyDeposit: { type: Number, default: 500 },
    initialDeposit: { type: Number, default: 0 },
    initialDepositDate: { type: Date },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    dividendRate: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Closed"], default: "Active" },
    closedAt: { type: Date },
    installments: [installmentSchema],
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("CD", cdAccountSchema);
