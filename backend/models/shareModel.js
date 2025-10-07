import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
    },
    totalSharesPurchased: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    sharePrice: {
      type: Number,
      default: 100, // you can adjust this as per your policy
    },
    purchaseHistory: [
      {
        date: { type: Date, default: Date.now },
        sharesBought: Number,
        amountPaid: Number,
        paymentMode: String,
        reference: String,
        notes: String,
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShareAccount", shareSchema);
