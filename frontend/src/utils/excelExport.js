// Excel exports shared by admin and member pages.
// Each *Sheets() helper takes a list of accounts and returns sheets with an
// "Account No" column, so one account or many export the same way.
import * as XLSX from "xlsx";
import { getLoanSummary, lumpSumsByInstallment } from "./loanSummary";

const d = (v) => (v ? new Date(v).toLocaleDateString("en-GB") : "");
const n = (v) => (v === undefined || v === null || v === "" ? "" : Number(v));
const memberName = (a) => a?.memberId?.name || "";

export function downloadExcel(fileName, sheets) {
  const wb = XLSX.utils.book_new();
  const used = new Set();

  sheets
    .filter((s) => s && s.rows && s.rows.length)
    .forEach(({ name, rows }) => {
      // Excel sheet names: max 31 chars, unique, no []:*?/\
      let base = String(name).replace(/[[\]:*?/\\]/g, " ").slice(0, 31);
      let sheetName = base;
      for (let i = 2; used.has(sheetName); i++)
        sheetName = `${base.slice(0, 28)} ${i}`;
      used.add(sheetName);

      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = Object.keys(rows[0]).map((key) => ({
        wch: Math.min(
          40,
          Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length)) + 2,
        ),
      }));
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

  if (!wb.SheetNames.length) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Info: "No records to export" }]),
      "Info",
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileName.replace(/[^\w-]+/g, "_")}_${stamp}.xlsx`);
}

// -------------------- Member --------------------
export const profileSheets = (m) =>
  m
    ? [
        {
          name: "Profile",
          rows: [
            {
              Name: m.name,
              "Society No": m.societyNumber || "",
              Email: m.email,
              Phone: m.phone,
              Department: m.department,
              Designation: m.designation,
              "KGID No": m.kgidNumber || "",
              "Member Type": m.memberType,
              "Joining Date": d(m.joiningDate),
              "Resign Date": d(m.resignDate),
              "Date of Birth": d(m.dob),
              Guardian: m.guardian || "",
              College: m.workingCollegeName || "",
              "Current Address": m.currentAddress || "",
              "Permanent Address": m.permanentAddress || "",
              Status: m.status,
            },
          ],
        },
      ]
    : [];

// -------------------- Loans --------------------
export function loanSheets(loans = []) {
  const list = loans.filter(Boolean);
  return [
    {
      name: "Loans",
      rows: list.map((l) => {
        const s = getLoanSummary(l);
        return {
          "Account No": l.accountNumber,
          Member: memberName(l),
          "Loan Type": l.loanType,
          "Loan Amount": n(l.loanAmount),
          "Interest %": n(l.interestRate),
          "Tenure (months)": n(l.tenure),
          "Start Date": d(l.startDate),
          "Current EMI": n(s.currentEMI),
          "Installments Paid": s.paidCount,
          "Installments Left": s.pendingCount,
          "Part Payments": n(s.totalLumpSum),
          Outstanding: n(s.outstanding),
          Status: l.loanStatus || "Active",
          "Closed On": d(l.closedAt),
        };
      }),
    },
    {
      name: "Loan Schedule",
      rows: list.flatMap((l) => {
        const lumps = lumpSumsByInstallment(l);
        return (l.repayments || []).map((r, i) => ({
          "Account No": l.accountNumber,
          "#": i + 1,
          "Due Date": d(r.dueDate),
          Principal: n(r.principal),
          Interest: n(r.interest),
          EMI: n(r.totalEMI),
          "Part Payment": n(
            (lumps[i + 1] || []).reduce((t, p) => t + Number(p.amount || 0), 0) ||
              "",
          ),
          Balance: n(r.scheduleOS),
          Status: r.status,
        }));
      }),
    },
    {
      name: "Loan Part Payments",
      rows: list.flatMap((l) =>
        (l.lumpSumPayments || []).map((p) => ({
          "Account No": l.accountNumber,
          Date: d(p.paidAt),
          Amount: n(p.amount),
          Option: p.mode === "reduceTenure" ? "Reduce tenure" : "Reduce EMI",
          "Balance Before": n(p.outstandingBefore),
          "Balance After": n(p.outstandingAfter),
          "EMI Before": n(p.emiBefore),
          "EMI After": n(p.emiAfter),
          Note: p.note || "",
        })),
      ),
    },
  ];
}

// -------------------- RD --------------------
export function rdSheets(rds = []) {
  const list = rds.filter(Boolean);
  return [
    {
      name: "RD Accounts",
      rows: list.map((r) => ({
        "Account No": r.accountNumber,
        Member: memberName(r),
        "Monthly Deposit": n(r.depositAmount),
        "Interest %": n(r.interestRate),
        "Tenure (months)": n(r.tenureMonths),
        "Start Date": d(r.startDate),
        "Maturity Date": d(r.maturityDate),
        "Total Deposited": n(r.totalDeposited),
        "Available Balance": n(r.availableBalance),
        "Maturity Amount": n(r.maturityAmount),
        Status: r.status,
      })),
    },
    {
      name: "RD Installments",
      rows: list.flatMap((r) =>
        (r.installments || []).map((i, idx) => ({
          "Account No": r.accountNumber,
          "#": idx + 1,
          "Due Date": d(i.dueDate),
          Amount: n(i.amount),
          Status: i.status,
          "Paid On": d(i.paidAt),
          Mode: i.paymentMode || "",
          Reference: i.reference || "",
        })),
      ),
    },
    {
      name: "RD Withdrawals",
      rows: list.flatMap((r) =>
        (r.withdrawals || []).map((w) => ({
          "Account No": r.accountNumber,
          Date: d(w.withdrawnAt),
          Amount: n(w.amount),
          "Cheque No": w.chequeNumber || "",
          "Cheque Date": d(w.chequeDate),
          Notes: w.notes || "",
        })),
      ),
    },
  ];
}

// -------------------- FD --------------------
export function fdSheets(fds = []) {
  const list = fds.filter(Boolean);
  return [
    {
      name: "FD Accounts",
      rows: list.map((f) => ({
        "FD No": f.fdNumber,
        "Account No": f.accountNumber,
        Member: memberName(f),
        Principal: n(f.principal),
        "Interest %": n(f.interestRate),
        "Tenure (months)": n(f.tenureMonths),
        "Start Date": d(f.startDate),
        "Maturity Date": d(f.maturityDate),
        "Maturity Amount": n(f.maturityAmount),
        "Total Withdrawn": n(
          (f.withdrawals || []).reduce((t, w) => t + Number(w.amount || 0), 0),
        ),
        Nominee: f.nominee || "",
        Status: f.status,
      })),
    },
    {
      name: "FD Withdrawals",
      rows: list.flatMap((f) =>
        (f.withdrawals || []).map((w) => ({
          "FD No": f.fdNumber,
          Date: d(w.date),
          Amount: n(w.amount),
          Mode: w.paymentMode || "",
          "Cheque No": w.chequeNumber || "",
          "Cheque Date": d(w.chequeDate),
          Reason: w.reason || "",
        })),
      ),
    },
  ];
}

// -------------------- CD --------------------
export function cdSheets(cds = []) {
  const list = cds.filter(Boolean);
  return [
    {
      name: "CD Accounts",
      rows: list.map((c) => ({
        "Account No": c.accountNumber,
        Member: memberName(c),
        "Monthly Deposit": n(c.monthlyDeposit),
        "Start Date": d(c.startDate),
        "Total Deposited": n(c.totalDeposited),
        "Total Withdrawn": n(c.totalWithdrawn),
        Balance: n(c.balance),
        "Dividend %": n(c.dividendRate),
        Status: c.status,
        "Closed On": d(c.closedAt),
      })),
    },
    {
      name: "CD Installments",
      rows: list.flatMap((c) =>
        (c.installments || []).map((i) => ({
          "Account No": c.accountNumber,
          Month: i.monthNo,
          "Due Date": d(i.dueDate),
          Amount: n(i.amount),
          Status: i.status,
          "Paid On": d(i.paidAt),
        })),
      ),
    },
    {
      name: "CD Transactions",
      rows: list.flatMap((c) =>
        (c.transactions || []).map((t) => ({
          "Account No": c.accountNumber,
          Date: d(t.date),
          Type: t.type,
          Amount: n(t.amount),
          Mode: t.paymentMode || "",
          Reference: t.reference || t.chequeNumber || "",
          Notes: t.reason || t.notes || "",
        })),
      ),
    },
  ];
}

// -------------------- Shares --------------------
export function shareSheets(shares = []) {
  const list = shares.filter(Boolean);
  const acc = (s) => s.societyShareNumber || memberName(s);
  return [
    {
      name: "Share Accounts",
      rows: list.map((s) => ({
        "Share No": s.societyShareNumber || "",
        Member: memberName(s),
        "Start Date": d(s.accountStartDate),
        "Shares Purchased": n(s.totalSharesPurchased),
        "Total Amount": n(s.totalAmount),
        "Current Shares": n(s.currentSharesBalance),
        "Current Amount": n(s.currentAmountBalance),
        "Share Price": n(s.sharePrice),
        Status: s.status,
        "Closed On": d(s.closedAt),
      })),
    },
    {
      name: "Share Purchases",
      rows: list.flatMap((s) =>
        (s.purchaseHistory || []).map((p) => ({
          "Share No": acc(s),
          Date: d(p.purchaseDate),
          Shares: n(p.sharesBought),
          Amount: n(p.amountPaid),
          Mode: p.paymentMode || "",
          Reference: p.reference || "",
          Notes: p.notes || "",
        })),
      ),
    },
    {
      name: "Share Withdrawals",
      rows: list.flatMap((s) =>
        (s.withdrawalHistory || []).map((w) => ({
          "Share No": acc(s),
          Date: d(w.withdrawalDate),
          "Shares Returned": n(w.sharesReturned),
          "Amount Paid Out": n(w.amountPaidOut),
          Mode: w.paymentMode || "",
          "Cheque No": w.chequeNumber || "",
          Notes: w.notes || "",
        })),
      ),
    },
  ];
}
