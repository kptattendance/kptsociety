"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";
import LoadOverlay from "../../../components/LoadOverlay";

export default function CDScheduleModal({ cdId, onClose }) {
  const { getToken } = useAuth();
  const [cd, setCD] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [pageInstallments, setPageInstallments] = useState(1);
  const [pageWithdrawals, setPageWithdrawals] = useState(1);
  const [pageDividends, setPageDividends] = useState(1);
  const itemsPerPage = 6;
  const [processing, setProcessing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Editing states for installment month & date
  const [editingMonthIndex, setEditingMonthIndex] = useState(null);
  const [editMonth, setEditMonth] = useState("");
  const [editingDateIndex, setEditingDateIndex] = useState(null);
  const [editDate, setEditDate] = useState("");

  // Keep this inside your component or a helper file
  const formatDateLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // ✅ always local, no UTC shift
  };

  // Fetch CD data
  const fetchCD = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCD(res.data);
    } catch (err) {
      toast.error("Failed to fetch CD data");
    } finally {
      setLoading(false);
    }
  };
  // Inside CDScheduleModal
  useEffect(() => {
    if (cdId) {
      fetchCD().then(() => onLoadComplete?.());
    }
  }, [cdId]);

  // Update Installment Paid/Pending
  const updateInstallment = async (installmentNo, status) => {
    try {
      setProcessing(true); // 🔹 Show overlay
      const token = await getToken();

      const installment = cd.installments.find(
        (inst) => inst.monthNo === installmentNo
      );

      const updatedDate =
        installment?.tempDueDate || installment?.dueDate || new Date();

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/installment/${cdId}/${installmentNo}`,
        { status, dueDate: updatedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Installment #${installmentNo} updated successfully`);
      await fetchCD();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update installment");
    } finally {
      setProcessing(false); // 🔹 Hide overlay
    }
  };

  if (!cd) return <div>Loading...</div>; // safety check

  // Pagination helpers
  const paginate = (arr, page) => {
    const start = (page - 1) * itemsPerPage;
    return arr.slice(start, start + itemsPerPage);
  };

  const totalInstallmentPages = Math.ceil(
    cd.installments.length / itemsPerPage
  );
  const withdrawals = cd.transactions.filter((t) => t.type === "Withdrawal");
  const dividends = cd.transactions.filter((t) => t.type === "Dividend");
  const totalWithdrawalPages = Math.ceil(withdrawals.length / itemsPerPage);
  const totalDividendPages = Math.ceil(dividends.length / itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-red-500"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-center text-teal-700 mb-5 tracking-wide">
          💠 CD Account – {cd.accountNumber}
        </h2>

        {/* --- Top Summary Box --- */}
        <div className="bg-gradient-to-r from-teal-50 via-green-50 to-emerald-100 border border-teal-200 shadow-sm rounded-xl p-4 mb-5">
          <div className="flex justify-between flex-wrap gap-3">
            <div>
              <p className="text-gray-700">
                <span className="font-semibold">👤 Member:</span>{" "}
                {cd.memberId?.name || "Unknown"}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">💰 Balance:</span> ₹
                {cd.balance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">📊 Status:</span>{" "}
                <span
                  className={`${
                    cd.status === "Active" ? "text-green-700" : "text-red-600"
                  } font-semibold`}
                >
                  {cd.status}
                </span>
              </p>
            </div>
          </div>
        </div>
        <LoadOverlay show={processing} />

        {/* 🗓️ INSTALLMENT SCHEDULE */}
        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl border border-teal-200 shadow p-4 mb-5">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">
            🗓️ Installment Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-teal-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {paginate(cd.installments, pageInstallments).map(
                  (inst, idx) => {
                    // Correct 0-based global index
                    const globalIndex =
                      (pageInstallments - 1) * itemsPerPage + idx;

                    return (
                      <tr
                        key={globalIndex}
                        className={`border-b text-center ${
                          idx % 2 === 0 ? "bg-teal-50/60" : "bg-white"
                        }`}
                      >
                        {/* Serial Number (human readable 1-based) */}
                        <td className="px-3 py-2">{globalIndex + 1}</td>

                        {/* 🗓️ Editable Month (Full Date) */}
                        <td
                          className="p-2 cursor-pointer"
                          onClick={() => {
                            setEditingMonthIndex(globalIndex);
                            setEditMonth(
                              formatDateLocal(inst.tempDueDate || inst.dueDate)
                            );
                          }}
                        >
                          {editingMonthIndex === globalIndex ? (
                            <input
                              key={
                                idx + (inst.tempDueDate || inst.dueDate || "")
                              }
                              type="date"
                              value={
                                editMonth ||
                                formatDateLocal(
                                  inst.tempDueDate || inst.dueDate
                                )
                              }
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setEditMonth(newVal);

                                const updated = [...cd.installments];
                                updated[globalIndex].tempDueDate = newVal;
                                setCD({ ...cd, installments: updated });
                              }}
                              onBlur={() => setEditingMonthIndex(null)}
                              className="border px-2 py-1 rounded w-[130px] text-center"
                            />
                          ) : (
                            <span className="hover:underline text-blue-700">
                              {new Date(
                                inst.tempDueDate || inst.dueDate
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                              {inst.tempDueDate && (
                                <span className="ml-1 text-xs text-orange-500">
                                  (unsaved)
                                </span>
                              )}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-2">
                          ₹
                          {Number(inst.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-3 py-2">
                          <select
                            value={inst.status}
                            onChange={(e) =>
                              updateInstallment(globalIndex, e.target.value)
                            }
                            className={`border rounded px-2 py-1 ${
                              inst.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>

                        {/* Paid At Date Inline Edit */}
                        <td
                          className="px-3 py-2 cursor-pointer"
                          onClick={() => {
                            setEditingDateIndex(globalIndex);
                            setEditDate(formatDateLocal(inst.paidAt));
                          }}
                        >
                          {editingDateIndex === globalIndex ? (
                            <input
                              type="date"
                              value={editDate || formatDateLocal(inst.paidAt)}
                              onChange={(e) => setEditDate(e.target.value)}
                              onBlur={() => {
                                const updated = [...cd.installments];
                                updated[globalIndex].paidAt = editDate;

                                setCD({ ...cd, installments: updated });
                                setEditingDateIndex(null);
                                toast.info(`Saved date ${editDate}`);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Escape")
                                  setEditingDateIndex(null);
                              }}
                              autoFocus
                              className="border rounded px-2 py-1 w-36 text-sm focus:ring-2 focus:ring-teal-300 outline-none"
                            />
                          ) : inst.paidAt ? (
                            new Date(inst.paidAt).toLocaleDateString("en-GB")
                          ) : (
                            <span className="text-gray-400 italic">
                              Click to add
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination for Installments */}
        <div className="flex justify-end mt-2 gap-2 items-center">
          <button
            onClick={() => setPageInstallments((p) => Math.max(1, p - 1))}
            disabled={pageInstallments === 1}
            className="p-1 border rounded disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm">
            Page {pageInstallments} of{" "}
            {Math.ceil(cd.installments.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setPageInstallments((p) =>
                Math.min(
                  Math.ceil(cd.installments.length / itemsPerPage),
                  p + 1
                )
              )
            }
            disabled={
              pageInstallments ===
              Math.ceil(cd.installments.length / itemsPerPage)
            }
            className="p-1 border rounded disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <LoadOverlay show={withdrawing} />

        {/* Manual Withdrawal Form */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 p-4 rounded-lg shadow-md w-fit">
          <h4 className="font-semibold text-gray-700 mb-2">
            💸 Withdraw Amount
          </h4>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const amount = parseFloat(e.target.amount.value);
              const reason = e.target.reason.value.trim();
              const chequeNumber = e.target.chequeNumber.value.trim();
              const chequeDate = e.target.chequeDate.value;

              if (!amount || amount <= 0) {
                toast.error("Please enter a valid amount");
                return;
              }
              if (!chequeNumber || !chequeDate) {
                toast.error("Please enter cheque number and date");
                return;
              }

              try {
                setWithdrawing(true); // 🔹 Show overlay
                const token = await getToken();
                await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}/withdraw`,
                  { amount, reason, chequeNumber, chequeDate },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success(`₹${amount.toFixed(2)} withdrawn successfully`);
                fetchCD();
                e.target.reset();
              } catch (err) {
                toast.error(err.response?.data?.error || "Withdrawal failed");
              } finally {
                setWithdrawing(false); // 🔹 Hide overlay
              }
            }}
            className="flex flex-wrap gap-3 items-end"
          >
            <div>
              <label className="text-sm text-gray-600 mr-3">Amount</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="1"
                onWheel={(e) => e.target.blur()}
                className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-blue-300 outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mr-3">Reason</label>
              <input
                type="text"
                name="reason"
                placeholder="e.g. Emergency"
                className="border rounded px-2 py-1 w-40 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mr-3">Cheque No.</label>
              <input
                type="text"
                name="chequeNumber"
                className="border rounded px-2 py-1 w-32 focus:ring-2 focus:ring-blue-300 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mr-3">Cheque Date</label>
              <input
                type="date"
                name="chequeDate"
                className="border rounded px-2 py-1 w-36 focus:ring-2 focus:ring-blue-300 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded shadow hover:from-blue-700 hover:to-indigo-700"
            >
              Withdraw
            </button>
          </form>
        </div>

        {/* 🔴 WITHDRAWAL HISTORY */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl border border-rose-200 shadow p-4 mb-5">
          <h3 className="text-lg font-semibold text-rose-700 mb-3">
            💰 Withdrawal History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-rose-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Cheque No.</th>
                  <th className="px-3 py-2">Cheque Date</th>
                </tr>
              </thead>
              <tbody>
                {paginate(withdrawals, pageWithdrawals).map((t, idx) => (
                  <tr
                    key={idx}
                    className={`border-b text-center ${
                      idx % 2 === 0 ? "bg-rose-50/60" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-2">
                      {(pageWithdrawals - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-3 py-2">
                      ₹
                      {Number(t.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="px-3 py-2">{t.reason || "-"}</td>
                    <td className="px-3 py-2">{t.chequeNumber || "-"}</td>
                    <td className="px-3 py-2">
                      {t.chequeDate
                        ? new Date(t.chequeDate).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🟩 DIVIDEND HISTORY */}
        <div className="bg-gradient-to-br from-emerald-50 to-lime-50 rounded-xl border border-emerald-200 shadow p-4">
          <h3 className="text-lg font-semibold text-emerald-700 mb-3">
            💹 Dividend History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-emerald-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginate(dividends, pageDividends).map((t, idx) => (
                  <tr
                    key={idx}
                    className={`border-b text-center ${
                      idx % 2 === 0 ? "bg-emerald-50/60" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-2">
                      {(pageDividends - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(t.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-2">
                      ₹
                      {Number(t.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
