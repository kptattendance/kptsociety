import ShareAccount from "../models/shareModel.js";
import Member from "../models/memberModel.js";
import mongoose from "mongoose";

// ------------------- Create or Add Shares -------------------
export const createOrAddShares = async (req, res) => {
  try {
    const {
      memberId,
      sharesBought,
      sharePrice,
      paymentMode,
      reference,
      notes,
    } = req.body;

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const clerkId = member.clerkId;
    const pricePerShare = sharePrice ?? 100;
    const amountPaid = sharesBought * pricePerShare;

    // Lifetime limit = ₹50,000
    const limit = 50000;

    let shareAccount = await ShareAccount.findOne({ memberId });

    if (!shareAccount) {
      // Creating new share account
      if (amountPaid > limit)
        return res
          .status(400)
          .json({ error: "Purchase exceeds ₹50,000 limit" });

      shareAccount = new ShareAccount({
        memberId,
        clerkId,
        totalSharesPurchased: sharesBought,
        totalAmount: amountPaid,
        sharePrice: pricePerShare,
        purchaseHistory: [
          { sharesBought, amountPaid, paymentMode, reference, notes },
        ],
      });
    } else {
      // Adding more shares
      const newTotal = shareAccount.totalAmount + amountPaid;
      if (newTotal > limit)
        return res.status(400).json({
          error: `Purchase exceeds ₹50,000 limit. Remaining limit: ₹${
            limit - shareAccount.totalAmount
          }`,
        });

      shareAccount.totalSharesPurchased += sharesBought;
      shareAccount.totalAmount += amountPaid;
      shareAccount.purchaseHistory.push({
        sharesBought,
        amountPaid,
        paymentMode,
        reference,
        notes,
      });
    }

    await shareAccount.save();
    res.status(201).json(shareAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get All Share Accounts -------------------
export const getAllShares = async (req, res) => {
  try {
    const shares = await ShareAccount.find().populate(
      "memberId",
      "name email phone photo"
    );
    res.json(shares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Get All Shares of a Member -------------------
export const getMemberShares = async (req, res) => {
  try {
    const { memberId } = req.params;
    const isMongoId = mongoose.Types.ObjectId.isValid(memberId);
    const query = isMongoId ? { memberId } : { clerkId: memberId };

    const shareAccount = await ShareAccount.findOne(query).populate(
      "memberId",
      "name email phone photo"
    );
    if (!shareAccount)
      return res.status(404).json({ error: "Share account not found" });

    res.json(shareAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Update Share Account -------------------
export const updateShareAccount = async (req, res) => {
  try {
    const { shareId } = req.params;
    const updates = req.body;

    const share = await ShareAccount.findByIdAndUpdate(shareId, updates, {
      new: true,
      runValidators: true,
    });

    if (!share)
      return res.status(404).json({ error: "Share account not found" });
    res.json(share);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Close Share Account (Resignation) -------------------
export const closeShareAccount = async (req, res) => {
  try {
    const { shareId } = req.params;

    const share = await ShareAccount.findById(shareId);
    if (!share)
      return res.status(404).json({ error: "Share account not found" });
    if (share.status === "Closed")
      return res.status(400).json({ error: "Already closed" });

    share.status = "Closed";
    share.closedAt = new Date();

    await share.save();
    res.json({ message: "Share account closed successfully", share });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Delete Share Account -------------------
export const deleteShareAccount = async (req, res) => {
  try {
    const { shareId } = req.params;
    const share = await ShareAccount.findByIdAndDelete(shareId);
    if (!share)
      return res.status(404).json({ error: "Share account not found" });

    res.json({ message: "Share account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
