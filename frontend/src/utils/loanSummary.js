// Shared helpers so the admin list, the repayment modal and the member page
// all show the SAME numbers for a loan.

export const inr = (n, decimals = 2) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const shortDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export function getLoanSummary(loan) {
  const reps = loan?.repayments || [];

  // Installments are paid in order; count the continuous paid ones from #1.
  let lastPaid = 0;
  while (lastPaid < reps.length && reps[lastPaid].status === "Paid") lastPaid++;

  const next = reps[lastPaid];
  const pendingRows = reps.filter((r) => r.status !== "Paid");

  // Outstanding principal right now (includes every lump sum already paid).
  const outstanding =
    loan?.loanStatus === "Closed"
      ? 0
      : next
        ? Number(next.principal) + Number(next.scheduleOS)
        : 0;

  const lumpSums = loan?.lumpSumPayments || [];
  const totalLumpSum = lumpSums.reduce((s, p) => s + Number(p.amount || 0), 0);
  const emiPaid = reps
    .filter((r) => r.status === "Paid")
    .reduce((s, r) => s + Number(r.totalEMI || 0), 0);

  return {
    lastPaid,
    paidCount: reps.length - pendingRows.length,
    pendingCount: pendingRows.length,
    totalInstallments: reps.length,
    outstanding: Math.round(outstanding * 100) / 100,
    currentEMI: next?.totalEMI || 0,
    nextDue: next?.dueDate || null,
    nextIndex: next ? lastPaid : -1,
    totalLumpSum,
    totalPaid: emiPaid + totalLumpSum,
    outOfOrder: reps.slice(lastPaid).some((r) => r.status === "Paid"),
  };
}

// Lump sums keyed by the installment they were paid after (0 = before any EMI)
export function lumpSumsByInstallment(loan) {
  const map = {};
  (loan?.lumpSumPayments || []).forEach((p) => {
    const k = Number(p.installment) || 0;
    (map[k] = map[k] || []).push(p);
  });
  return map;
}
