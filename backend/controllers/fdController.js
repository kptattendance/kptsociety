import FD from "../models/fdAccount.js";
import Member from "../models/memberModel.js";

// -------------------------------------------------------------------
// ✅ Create New FD
// -------------------------------------------------------------------
export const createFD = async (req, res) => {
  try {
    const {
      memberId,
      principal,
      interestRate,
      tenureMonths,
      startDate,
      compoundingFrequency,
      payoutFrequency,
      autoRenew,
      preclosureAllowed,
      preclosurePenaltyPercent,
      notes,
    } = req.body;

    // ✅ Validate member exists
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    // ✅ Calculate maturity date
    const start = startDate ? new Date(startDate) : new Date();
    const maturityDate = new Date(start);
    maturityDate.setMonth(maturityDate.getMonth() + Number(tenureMonths));

    // ✅ Generate unique FD account number
    const accountNumber = `FD-${Date.now()}`;

    // ✅ Compute maturity amount (compound interest)
    const years = tenureMonths / 12;
    const maturityAmount = principal * Math.pow(1 + interestRate / 100, years);

    const fd = new FD({
      accountNumber,
      memberId: member._id,
      clerkId: member.clerkId || null,
      principal,
      tenureMonths,
      interestRate,
      startDate: start,
      maturityDate,
      compoundingFrequency: compoundingFrequency || "monthly",
      payoutFrequency: payoutFrequency || "maturity",
      autoRenew: autoRenew || false,
      preclosureAllowed: preclosureAllowed ?? true,
      preclosurePenaltyPercent: preclosurePenaltyPercent ?? 1.0,
      maturityAmount,
      notes,
      status: "Active",
    });

    await fd.save();
    res.status(201).json(fd);
  } catch (err) {
    console.error("FD creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Get ALL FDs (Admin View)
// -------------------------------------------------------------------
export const getAllFDs = async (req, res) => {
  try {
    const fds = await FD.find()
      .populate("memberId", "name email")
      .sort({ createdAt: -1 });
    res.json(fds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Get FDs by Member ID
// -------------------------------------------------------------------
export const getMemberFDs = async (req, res) => {
  try {
    const { memberId } = req.params;
    const fds = await FD.find({ memberId })
      .populate("memberId", "name email")
      .sort({ createdAt: -1 });
    res.json(fds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Get Single FD by ID
// -------------------------------------------------------------------
export const getFDById = async (req, res) => {
  try {
    const fd = await FD.findById(req.params.fdId).populate(
      "memberId",
      "name email"
    );
    if (!fd) return res.status(404).json({ error: "FD not found" });
    res.json(fd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Update FD (Admin Edit)
// -------------------------------------------------------------------
export const updateFD = async (req, res) => {
  try {
    const fd = await FD.findByIdAndUpdate(req.params.fdId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fd) return res.status(404).json({ message: "FD not found" });
    res.json(fd);
  } catch (error) {
    res.status(400).json({ message: "Error updating FD", error });
  }
};

// -------------------------------------------------------------------
// ✅ Pre-close FD (with penalty)
// -------------------------------------------------------------------
export const preCloseFD = async (req, res) => {
  try {
    const { fdId } = req.params;
    const fd = await FD.findById(fdId);
    if (!fd) return res.status(404).json({ error: "FD not found" });
    if (fd.status !== "Active")
      return res.status(400).json({ error: "FD is not active" });

    const now = new Date();
    fd.status = "PreClosed";
    fd.closedAt = now;

    // Penalty: reduce interest by preclosurePenaltyPercent
    const durationYears = (now - fd.startDate) / (1000 * 60 * 60 * 24 * 365);
    const effectiveRate =
      fd.interestRate - (fd.interestRate * fd.preclosurePenaltyPercent) / 100;

    const maturityAmount =
      fd.principal * Math.pow(1 + effectiveRate / 100, durationYears);

    fd.maturityAmount = maturityAmount.toFixed(2);
    await fd.save();

    res.json(fd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------------
// ✅ Close FD (on maturity or manually)
// -------------------------------------------------------------------
export const closeFD = async (req, res) => {
  try {
    const fd = await FD.findById(req.params.fdId);
    if (!fd) return res.status(404).json({ message: "FD not found" });

    fd.status = "Closed";
    fd.closedAt = new Date();

    await fd.save();
    res.json({ message: "FD closed successfully", fd });
  } catch (error) {
    res.status(400).json({ message: "Error closing FD", error });
  }
};

// -------------------------------------------------------------------
// ✅ Delete FD (Admin)
// -------------------------------------------------------------------
export const deleteFD = async (req, res) => {
  try {
    const fd = await FD.findByIdAndDelete(req.params.fdId);
    if (!fd) return res.status(404).json({ message: "FD not found" });
    res.json({ message: "FD deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting FD", error });
  }
};
