import mongoose from "mongoose";

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
    loanType: { type: String, required: true }, // e.g., Personal, Education, Housing
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenure: { type: Number, required: true }, // in months
    loanPurpose: { type: String },
    collateralType: { type: String }, // if any
    collateralDetails: { type: String },
    grossSalary: { type: Number, required: true }, // Gross salary at time of loan
    basicSalary: { type: Number, required: true }, // Basic salary at time of loan
    appliedAt: { type: Date, default: Date.now },
    repayments: [RepaymentSchema], // <-- add this
    status: { type: String, default: "Pending" }, // Pending, Approved, Rejected
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
