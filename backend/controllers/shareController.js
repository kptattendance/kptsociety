// controllers/shareController.js
import ShareAccount from "../models/shareModel.js";
import Member from "../models/memberModel.js";
import mongoose from "mongoose";

// Helper: compute amount from shares
const amountFromShares = (shares, price) => shares * price;

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
      processingFee,
      accountStartDate,
      societyShareNumber,
    } = req.body;

    if (!memberId || !sharesBought) {
      return res
        .status(400)
        .json({ error: "memberId and sharesBought required" });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const clerkId = member.clerkId; // or take from req.user if using auth middleware
    const pricePerShare = sharePrice ?? 100;
    const amountPaid = amountFromShares(sharesBought, pricePerShare);

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
        societyShareNumber: societyShareNumber || null,
        accountStartDate: accountStartDate
          ? new Date(accountStartDate)
          : undefined,
        totalSharesPurchased: sharesBought,
        totalAmount: amountPaid,
        currentSharesBalance: sharesBought,
        currentAmountBalance: amountPaid,
        sharePrice: pricePerShare,
        processingFee,

        purchaseHistory: [
          {
            sharesBought,
            amountPaid,
            paymentMode,
            reference,
            notes,
            date: new Date(),
          },
        ],
      });
    } else {
      // Adding more shares
      const newTotalAmount = shareAccount.totalAmount + amountPaid;
      if (newTotalAmount > limit)
        return res.status(400).json({
          error: `Purchase exceeds ₹50,000 limit. Remaining limit: ₹${
            limit - shareAccount.totalAmount
          }`,
        });

      shareAccount.totalSharesPurchased += sharesBought;
      shareAccount.totalAmount += amountPaid;
      shareAccount.currentSharesBalance += sharesBought;
      shareAccount.currentAmountBalance += amountPaid;

      if (societyShareNumber)
        shareAccount.societyShareNumber = societyShareNumber;
      if (accountStartDate)
        shareAccount.accountStartDate = new Date(accountStartDate);

      shareAccount.purchaseHistory.push({
        sharesBought,
        amountPaid,
        paymentMode,
        reference,
        notes,
        date: new Date(),
      });
    }

    await shareAccount.save();
    res.status(201).json(shareAccount);
  } catch (err) {
    console.error("createOrAddShares error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Withdraw (member takes back shares / receives payment) -------------------
export const withdrawFromShareAccount = async (req, res) => {
  try {
    const { shareId } = req.params;
    const {
      sharesReturned = 0,
      amountPaidOut, // numeric (we prefer computing from shares if not provided)
      paymentMode = "Cheque",
      chequeNumber,
      reference,
      notes,
      processedBy,
      date,
    } = req.body;

    if (!shareId) return res.status(400).json({ error: "shareId required" });

    const share = await ShareAccount.findById(shareId);
    if (!share)
      return res.status(404).json({ error: "Share account not found" });
    if (share.status === "Closed")
      return res.status(400).json({ error: "Account already closed" });

    // Compute amounts
    const price = share.sharePrice ?? 100;
    const computedRefundFromShares = sharesReturned * price;
    const payout =
      typeof amountPaidOut === "number"
        ? amountPaidOut
        : computedRefundFromShares;

    // Ensure we aren't paying more than current balance
    if (payout > share.currentAmountBalance + 0.0001)
      return res.status(400).json({
        error: `Withdrawal exceeds available balance. Remaining balance ₹${share.currentAmountBalance}`,
      });

    // Update balances
    share.currentAmountBalance = parseFloat(
      (share.currentAmountBalance - payout).toFixed(2)
    );
    share.currentSharesBalance = Math.max(
      0,
      share.currentSharesBalance - sharesReturned
    );

    // If sharesReturned is provided we also decrement totalSharesPurchased?
    // We keep totalSharesPurchased as lifetime metric, but we can optionally store "net" in another field.
    // For now we keep lifetime totals and current balances separately.

    const wd = {
      date: date ? new Date(date) : new Date(),
      sharesReturned,
      amountPaidOut: payout,
      paymentMode,
      chequeNumber,
      reference,
      processedBy,
      notes,
      remainingShares: share.currentSharesBalance,
      remainingAmount: share.currentAmountBalance,
    };

    share.withdrawalHistory.push(wd);

    // If current balance reaches zero and we want auto-close (optional)
    // if (share.currentAmountBalance <= 0 && share.currentSharesBalance === 0) {
    //   share.status = "Closed";
    //   share.closedAt = new Date();
    // }

    await share.save();
    res.json({ message: "Withdrawal recorded", withdrawal: wd, share });
  } catch (err) {
    console.error("withdrawFromShareAccount err:", err);
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

// ------------------- Get Member Shares -------------------
export const getMemberShares = async (req, res) => {
  try {
    const { memberId } = req.params;
    const isMongoId = mongoose.Types.ObjectId.isValid(memberId);
    const query = isMongoId ? { memberId } : { clerkId: memberId };
    const shareAccount = await ShareAccount.findOne(query).populate(
      "memberId",
      "name email phone photo"
    );

    if (!shareAccount) {
      return res.json({
        hasShare: false,
        message: "No share account found for this member",
        shareAccount: null,
      });
    }

    res.json({ hasShare: true, shareAccount });
  } catch (err) {
    console.error("getMemberShares error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Update Share Account (full edit) -------------------
export const updateShareAccount = async (req, res) => {
  try {
    const { shareId } = req.params;
    const updates = req.body;

    // Only allow certain fields by default, but since we want full editing we accept:
    // societyShareNumber, accountStartDate, sharePrice, currentSharesBalance, currentAmountBalance, status, etc.
    // For safety, normalize dates and numbers:
    if (updates.accountStartDate)
      updates.accountStartDate = new Date(updates.accountStartDate);
    if (typeof updates.sharePrice !== "undefined")
      updates.sharePrice = Number(updates.sharePrice);
    if (typeof updates.currentSharesBalance !== "undefined")
      updates.currentSharesBalance = Number(updates.currentSharesBalance);
    if (typeof updates.currentAmountBalance !== "undefined")
      updates.currentAmountBalance = Number(updates.currentAmountBalance);

    const share = await ShareAccount.findByIdAndUpdate(shareId, updates, {
      new: true,
      runValidators: true,
    });

    if (!share)
      return res.status(404).json({ error: "Share account not found" });
    res.json(share);
  } catch (err) {
    console.error("updateShareAccount err:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Close Share Account -------------------
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
    console.error("closeShareAccount err:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Delete Share Account -------------------
export const deleteShareAccount = async (req, res) => {
  try {
    const { shareId } = req.params;
    const share = await ShareAccount.findById(shareId);
    if (!share)
      return res.status(404).json({ error: "Share account not found" });

    await ShareAccount.findByIdAndDelete(shareId);
    res.json({ message: "Share account deleted successfully" });
  } catch (err) {
    console.error("deleteShareAccount err:", err);
    res.status(500).json({ error: err.message });
  }
};
