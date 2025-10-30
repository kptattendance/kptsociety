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
      purchaseDate, // optional custom date from UI
    } = req.body;

    if (!memberId || !sharesBought) {
      return res
        .status(400)
        .json({ error: "memberId and sharesBought are required" });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const clerkId = member.clerkId;
    const pricePerShare = sharePrice ?? 100;
    const amountPaid = amountFromShares(sharesBought, pricePerShare);

    // Lifetime limit = ₹50,000
    const limit = 50000;

    let shareAccount = await ShareAccount.findOne({ memberId });

    // ------------------- Create new share account -------------------
    if (!shareAccount) {
      if (amountPaid > limit) {
        return res
          .status(400)
          .json({ error: "Purchase exceeds ₹50,000 limit" });
      }

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
            purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
            sharesBought,
            amountPaid,
            paymentMode,
            reference,
            notes,
          },
        ],
      });
    }

    // ------------------- Add shares to existing account -------------------
    else {
      const newTotalAmount = shareAccount.totalAmount + amountPaid;
      if (newTotalAmount > limit) {
        return res.status(400).json({
          error: `Purchase exceeds ₹50,000 limit. Remaining limit: ₹${
            limit - shareAccount.totalAmount
          }`,
        });
      }

      shareAccount.totalSharesPurchased += sharesBought;
      shareAccount.totalAmount += amountPaid;
      shareAccount.currentSharesBalance += sharesBought;
      shareAccount.currentAmountBalance += amountPaid;

      if (societyShareNumber)
        shareAccount.societyShareNumber = societyShareNumber;
      if (accountStartDate)
        shareAccount.accountStartDate = new Date(accountStartDate);

      shareAccount.purchaseHistory.push({
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
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
      amountPaidOut,
      paymentMode = "Cheque",
      chequeNumber,
      reference,
      notes,
      processedBy,
      withdrawalDate, // renamed for consistency
    } = req.body;

    if (!shareId) return res.status(400).json({ error: "shareId is required" });

    const share = await ShareAccount.findById(shareId);
    if (!share)
      return res.status(404).json({ error: "Share account not found" });
    if (share.status === "Closed")
      return res.status(400).json({ error: "Account already closed" });

    // Compute payout
    const price = share.sharePrice ?? 100;
    const computedRefundFromShares = sharesReturned * price;
    const payout =
      typeof amountPaidOut === "number"
        ? amountPaidOut
        : computedRefundFromShares;

    // Check balance
    if (payout > share.currentAmountBalance + 0.0001) {
      return res.status(400).json({
        error: `Withdrawal exceeds available balance. Remaining balance ₹${share.currentAmountBalance}`,
      });
    }

    // Update balances
    share.currentAmountBalance = parseFloat(
      (share.currentAmountBalance - payout).toFixed(2)
    );
    share.currentSharesBalance = Math.max(
      0,
      share.currentSharesBalance - sharesReturned
    );

    const wd = {
      withdrawalDate: withdrawalDate ? new Date(withdrawalDate) : new Date(),
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

    await share.save();
    res.json({ message: "Withdrawal recorded", withdrawal: wd, share });
  } catch (err) {
    console.error("withdrawFromShareAccount error:", err);
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
    console.error("getAllShares error:", err);
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
    console.error("updateShareAccount error:", err);
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
    console.error("closeShareAccount error:", err);
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
    console.error("deleteShareAccount error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Update Purchase Entry -------------------
export const updatePurchaseEntry = async (req, res) => {
  try {
    const { shareId, purchaseIndex } = req.params;
    const updates = req.body;

    const share = await ShareAccount.findById(shareId);
    if (!share)
      return res.status(404).json({ error: "Share account not found" });

    if (!share.purchaseHistory[purchaseIndex])
      return res.status(404).json({ error: "Purchase entry not found" });

    Object.assign(share.purchaseHistory[purchaseIndex], updates);

    // Optionally, recalc totals if sharesBought or amountPaid changed
    share.totalSharesPurchased = share.purchaseHistory.reduce(
      (sum, p) => sum + (p.sharesBought || 0),
      0
    );
    share.totalAmount = share.purchaseHistory.reduce(
      (sum, p) => sum + (p.amountPaid || 0),
      0
    );
    share.currentSharesBalance = share.totalSharesPurchased;
    share.currentAmountBalance = share.totalAmount;

    await share.save();
    res.json({ message: "Purchase entry updated successfully", share });
  } catch (err) {
    console.error("updatePurchaseEntry error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------- Delete Purchase Entry -------------------
export const deletePurchaseEntry = async (req, res) => {
  try {
    const { shareId, purchaseIndex } = req.params;

    const share = await ShareAccount.findById(shareId);
    if (!share)
      return res.status(404).json({ error: "Share account not found" });

    if (!share.purchaseHistory[purchaseIndex])
      return res.status(404).json({ error: "Purchase entry not found" });

    share.purchaseHistory.splice(purchaseIndex, 1);

    // Recalculate totals
    share.totalSharesPurchased = share.purchaseHistory.reduce(
      (sum, p) => sum + (p.sharesBought || 0),
      0
    );
    share.totalAmount = share.purchaseHistory.reduce(
      (sum, p) => sum + (p.amountPaid || 0),
      0
    );
    share.currentSharesBalance = share.totalSharesPurchased;
    share.currentAmountBalance = share.totalAmount;

    await share.save();
    res.json({ message: "Purchase entry deleted successfully", share });
  } catch (err) {
    console.error("deletePurchaseEntry error:", err);
    res.status(500).json({ error: err.message });
  }
};
