"use client";
import { useState, useEffect, Fragment } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import {
  X,
  CheckCircle2,
  Undo2,
  ArrowRight,
  Wallet,
  CalendarClock,
  ListChecks,
  IndianRupee,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadOverlay from "../../../components/LoadOverlay";
import {
  inr,
  shortDate,
  getLoanSummary,
  lumpSumsByInstallment,
} from "../../../utils/loanSummary";

const today = () => new Date().toISOString().split("T")[0];
const toInputDate = (d) => new Date(d).toISOString().split("T")[0];

export default function LoanRepaymentModal({ loanId, onClose }) {
  const { getToken } = useAuth();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Paid-date chosen for the next installment (defaults to its due date)
  const [paidDate, setPaidDate] = useState("");

  // Part-payment form
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("reduceTenure");
  const [payDate, setPayDate] = useState(today());
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(null);

  const api = async (method, url, data) => {
    const token = await getToken();
    return axios({
      method,
      url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await api("get", `/api/loans/${loanId}/repay`);
      setLoan(res.data);
      setPaidDate("");
    } catch {
      toast.error("Failed to load loan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Any change to the form makes the old preview stale
  useEffect(() => setPreview(null), [amount, mode]);

  if (!loan) return <LoadOverlay show />;

  const s = getLoanSummary(loan);
  const lumpMap = lumpSumsByInstallment(loan);
  const isClosed = loan.loanStatus === "Closed";

  const setStatus = async (installmentNo, status, dueDate) => {
    try {
      setLoading(true);
      await api("patch", `/api/loans/repay/${loanId}/${installmentNo}`, {
        status,
        ...(dueDate ? { dueDate } : {}),
      });
      toast.success(`Installment #${installmentNo} marked ${status}`);
      await fetchLoan();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const runPrepay = async (isPreview) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.warning("Enter the amount paid");
    if (amt > s.outstanding)
      return toast.warning(
        `Amount is more than the outstanding ${inr(s.outstanding)}`,
      );
    try {
      setLoading(true);
      const res = await api("patch", `/api/loans/prepay/${loanId}`, {
        amount: amt,
        mode,
        paidAt: payDate,
        note,
        preview: isPreview,
      });
      if (isPreview) {
        setPreview(res.data.summary);
      } else {
        toast.success(res.data.message);
        setAmount("");
        setNote("");
        setPreview(null);
        await fetchLoan();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply payment");
    } finally {
      setLoading(false);
    }
  };

  const deleteLumpSum = async (p) => {
    const result = await Swal.fire({
      title: "Delete part payment?",
      html: `${inr(p.amount)} paid on ${shortDate(p.paidAt)} will be removed and the schedule restored to what it was before this payment.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      const res = await api("delete", `/api/loans/prepay/${loanId}/${p._id}`);
      toast.success(res.data.message);
      setPreview(null);
      await fetchLoan();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete part payment");
    } finally {
      setLoading(false);
    }
  };

  const LumpRow = ({ p }) => (
    <tr className="bg-violet-50 text-violet-900 text-sm">
      <td colSpan={7} className="px-3 py-2">
        <span className="font-semibold">Part payment {inr(p.amount)}</span>
        {" on "}
        {shortDate(p.paidAt)} ·{" "}
        {p.mode === "reduceTenure" ? "Reduced tenure" : "Reduced EMI"}
        {p.outstandingBefore != null && (
          <>
            {" "}
            · balance {inr(p.outstandingBefore)} → {inr(p.outstandingAfter)}
          </>
        )}
      </td>
    </tr>
  );

  return (
    <>
      <LoadOverlay show={loading} />

      <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[92vh] overflow-auto shadow-soft relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b px-4 sm:px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {loan.loanType} · A/c {loan.accountNumber}
              </h3>
              <p className="text-sm text-gray-500">
                {loan.memberId?.name || ""} · {inr(loan.loanAmount, 0)} at{" "}
                {loan.interestRate}% for {loan.tenure} months
                {isClosed && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                    Closed
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 cursor-pointer"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat
                icon={<Wallet size={18} />}
                label="Outstanding balance"
                value={inr(s.outstanding)}
                tone="blue"
              />
              <Stat
                icon={<IndianRupee size={18} />}
                label="Current EMI"
                value={s.currentEMI ? inr(s.currentEMI) : "-"}
              />
              <Stat
                icon={<ListChecks size={18} />}
                label="Installments paid"
                value={`${s.paidCount} of ${s.totalInstallments}`}
                sub={`${s.pendingCount} remaining`}
              />
              <Stat
                icon={<CalendarClock size={18} />}
                label="Next due"
                value={s.nextDue ? shortDate(s.nextDue) : "-"}
                sub={
                  s.totalLumpSum
                    ? `Part payments so far: ${inr(s.totalLumpSum, 0)}`
                    : undefined
                }
              />
            </div>

            {s.outOfOrder && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 text-sm">
                Some later installments are marked Paid while an earlier one is
                still pending. Mark installments in order so the balance stays
                correct.
              </div>
            )}

            {/* Part payment */}
            {!isClosed && s.outstanding > 0 && (
              <section className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 sm:p-5">
                <h4 className="text-lg font-semibold text-violet-800">
                  Record a part payment
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Extra money paid on top of the EMI. It is applied after the
                  last paid installment (
                  {s.lastPaid ? `#${s.lastPaid}` : "before the first EMI"}) and
                  reduces the balance of {inr(s.outstanding)}.
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-sm">
                    <span className="block font-medium mb-1">Amount paid</span>
                    <input
                      type="number"
                      min="1"
                      max={s.outstanding}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="e.g. 20000"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => setAmount(String(s.outstanding))}
                      className="text-xs text-violet-700 underline mt-1"
                    >
                      Pay full balance ({inr(s.outstanding)})
                    </button>
                  </label>
                  <label className="text-sm">
                    <span className="block font-medium mb-1">Payment date</span>
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block font-medium mb-1">
                      Note (optional)
                    </span>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Receipt no., cash/cheque…"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  <ModeOption
                    checked={mode === "reduceTenure"}
                    onChange={() => setMode("reduceTenure")}
                    title="Keep EMI, finish earlier"
                    text={`EMI stays ${inr(s.currentEMI)}; fewer installments remain.`}
                  />
                  <ModeOption
                    checked={mode === "reduceEMI"}
                    onChange={() => setMode("reduceEMI")}
                    title="Keep end date, lower EMI"
                    text={`${s.pendingCount} installments remain; each EMI gets smaller.`}
                  />
                </div>

                {preview && (
                  <div className="mt-4 rounded-lg border bg-white p-4">
                    <p className="font-semibold mb-3">After this payment</p>
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <Change
                        label="Outstanding"
                        from={inr(preview.outstandingBefore)}
                        to={inr(preview.outstandingAfter)}
                      />
                      <Change
                        label="EMI"
                        from={inr(preview.emiBefore)}
                        to={preview.closesLoan ? "—" : inr(preview.emiAfter)}
                      />
                      <Change
                        label="Installments left"
                        from={preview.installmentsLeftBefore}
                        to={preview.installmentsLeftAfter}
                      />
                    </div>
                    {preview.closesLoan && (
                      <p className="mt-3 text-green-700 font-medium">
                        This clears the loan. It will be marked Closed.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 justify-end mt-4">
                  {!preview ? (
                    <button
                      onClick={() => runPrepay(true)}
                      className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 cursor-pointer"
                    >
                      Preview
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setPreview(null)}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => runPrepay(false)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                      >
                        Confirm & save {inr(Number(amount))}
                      </button>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Schedule */}
            <section>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">
                Repayment schedule
              </h4>
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Due date</th>
                      <th className="p-2 text-right">Principal</th>
                      <th className="p-2 text-right">Interest</th>
                      <th className="p-2 text-right">EMI</th>
                      <th className="p-2 text-right">Balance after</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lumpMap[0] || []).map((p, k) => (
                      <LumpRow key={`l0-${k}`} p={p} />
                    ))}
                    {loan.repayments.map((r, i) => {
                      const no = i + 1;
                      const isPaid = r.status === "Paid";
                      const isNext = i === s.nextIndex && !isClosed;
                      const isLastPaid = isPaid && no === s.lastPaid;
                      return (
                        <Fragment key={i}>
                          <tr
                            className={`border-t ${
                              isPaid
                                ? "bg-green-50 text-gray-600"
                                : isNext
                                  ? "bg-amber-50"
                                  : ""
                            }`}
                          >
                            <td className="p-2">{no}</td>
                            <td className="p-2">
                              {isNext ? (
                                <input
                                  type="date"
                                  value={paidDate || toInputDate(r.dueDate)}
                                  onChange={(e) => setPaidDate(e.target.value)}
                                  className="border rounded px-2 py-1"
                                  title="Change if paid on a different date"
                                />
                              ) : (
                                shortDate(r.dueDate)
                              )}
                            </td>
                            <td className="p-2 text-right">
                              {inr(r.principal)}
                            </td>
                            <td className="p-2 text-right">
                              {inr(r.interest)}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              {inr(r.totalEMI)}
                            </td>
                            <td className="p-2 text-right text-blue-700">
                              {inr(r.scheduleOS)}
                            </td>
                            <td className="p-2 text-center whitespace-nowrap">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                                  <CheckCircle2 size={16} /> Paid
                                  {isLastPaid && !isClosed && (
                                    <button
                                      onClick={() => setStatus(no, "Pending")}
                                      className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 cursor-pointer"
                                      title="Undo – mark as pending"
                                    >
                                      <Undo2 size={14} /> Undo
                                    </button>
                                  )}
                                </span>
                              ) : isNext ? (
                                <button
                                  onClick={() =>
                                    setStatus(no, "Paid", paidDate || undefined)
                                  }
                                  className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                                >
                                  Mark paid
                                </button>
                              ) : (
                                <span className="text-gray-400">Pending</span>
                              )}
                            </td>
                          </tr>
                          {(lumpMap[no] || []).map((p, k) => (
                            <LumpRow key={`l${no}-${k}`} p={p} />
                          ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* History */}
            {loan.lumpSumPayments?.length > 0 && (
              <section>
                <h4 className="text-lg font-semibold mb-2 text-gray-800">
                  Part payment history
                </h4>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-left">After inst.</th>
                        <th className="p-2 text-left">Option</th>
                        <th className="p-2 text-right">Balance</th>
                        <th className="p-2 text-right">EMI</th>
                        <th className="p-2 text-left">Note</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan.lumpSumPayments.map((p, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{shortDate(p.paidAt)}</td>
                          <td className="p-2 text-right font-semibold">
                            {inr(p.amount)}
                          </td>
                          <td className="p-2">
                            {p.installment ? `#${p.installment}` : "Start"}
                          </td>
                          <td className="p-2">
                            {p.mode === "reduceTenure"
                              ? "Reduce tenure"
                              : "Reduce EMI"}
                          </td>
                          <td className="p-2 text-right">
                            {p.outstandingBefore != null
                              ? `${inr(p.outstandingBefore, 0)} → ${inr(p.outstandingAfter, 0)}`
                              : "-"}
                          </td>
                          <td className="p-2 text-right">
                            {p.emiBefore != null
                              ? `${inr(p.emiBefore, 0)} → ${inr(p.emiAfter, 0)}`
                              : "-"}
                          </td>
                          <td className="p-2">{p.note || "-"}</td>
                          <td className="p-2 text-center">
                            {i === loan.lumpSumPayments.length - 1 ? (
                              <button
                                onClick={() => deleteLumpSum(p)}
                                title="Delete this part payment"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            ) : (
                              <span
                                className="text-xs text-gray-400"
                                title="Delete the newer part payments first"
                              >
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, label, value, sub, tone }) {
  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 ${
        tone === "blue" ? "bg-blue-50 border-blue-200" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
        {icon}
        {label}
      </div>
      <div
        className={`mt-1 text-lg sm:text-xl font-bold ${
          tone === "blue" ? "text-blue-800" : "text-gray-800"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ModeOption({ checked, onChange, title, text }) {
  return (
    <label
      className={`flex gap-3 items-start rounded-lg border p-3 cursor-pointer ${
        checked ? "border-violet-500 bg-white ring-1 ring-violet-500" : "bg-white"
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-gray-600">{text}</span>
      </span>
    </label>
  );
}

function Change({ label, from, to }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="text-gray-500">{label}</div>
      <div className="flex items-center gap-2 font-semibold mt-1">
        <span className="text-gray-500 line-through decoration-1">{from}</span>
        <ArrowRight size={14} />
        <span className="text-gray-900">{to}</span>
      </div>
    </div>
  );
}
