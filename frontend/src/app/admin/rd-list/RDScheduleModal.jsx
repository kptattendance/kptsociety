"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function RDScheduleModal({ rdId, onClose }) {
  const { getToken } = useAuth();
  const [rd, setRD] = useState(null);
  const [loading, setLoading] = useState(false);

  const [pageInstallments, setPageInstallments] = useState(1);
  const [pageWithdrawals, setPageWithdrawals] = useState(1);
  const itemsPerPage = 6;

  const [editingDateIndex, setEditingDateIndex] = useState(null);
  const [editDate, setEditDate] = useState("");

  // Fetch RD details
  const fetchRD = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRD(res.data);
    } catch (err) {
      toast.error("Failed to fetch RD data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rdId) fetchRD();
  }, [rdId]);

  const updateInstallmentStatus = async (installmentNo, status) => {
    try {
      const token = await getToken();
      const installment = rd.installments[installmentNo - 1];
      const updatedDate = installment?.tempDueDate || installment?.dueDate;

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/installment/${rdId}/${installmentNo}`,
        { status, dueDate: updatedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Installment #${installmentNo} updated successfully`);
      fetchRD();
    } catch (err) {
      toast.error("Failed to update installment");
    }
  };

  if (!rd) return null;

  const paginate = (arr, page) => {
    const start = (page - 1) * itemsPerPage;
    return arr.slice(start, start + itemsPerPage);
  };

  const totalInstallmentPages = Math.ceil(
    rd.installments.length / itemsPerPage
  );
  const totalWithdrawalPages = Math.ceil(
    (rd.withdrawals || []).length / itemsPerPage
  );

  const balance =
    rd.totalDeposited -
    (rd.withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3  text-gray-500 cursor-pointer hover:text-red-500"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold text-center text-teal-700 mb-5 tracking-wide">
          📅 RD Account – {rd.accountNumber}
        </h2>

        {/* Installment Schedule */}
        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl border border-teal-200 shadow p-4 mb-5">
          <h3 className="text-lg font-semibold text-teal-800 mb-3">
            🗓️ Installment Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-teal-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Due Date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {paginate(rd.installments, pageInstallments).map(
                  (inst, idx) => {
                    const globalIndex =
                      (pageInstallments - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr
                        key={idx}
                        className={`border-b text-center ${
                          inst.status === "Paid" ? "bg-green-50" : ""
                        }`}
                      >
                        <td className="px-3 py-2">{globalIndex}</td>
                        <td
                          className="px-3 py-2 cursor-pointer"
                          onClick={() => setEditingDateIndex(globalIndex - 1)}
                        >
                          {editingDateIndex === globalIndex - 1 ? (
                            <input
                              type="date"
                              value={
                                editDate ||
                                inst.tempDueDate ||
                                new Date(inst.dueDate)
                                  .toISOString()
                                  .split("T")[0]
                              }
                              onChange={(e) => {
                                setEditDate(e.target.value);
                                const updated = [...rd.installments];
                                updated[globalIndex - 1].tempDueDate =
                                  e.target.value;
                                setRD({ ...rd, installments: updated });
                              }}
                              onBlur={() => setEditingDateIndex(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Escape")
                                  setEditingDateIndex(null);
                              }}
                              autoFocus
                              className="border rounded px-2 py-1 w-36 text-center focus:ring-2 focus:ring-teal-300 outline-none"
                            />
                          ) : (
                            <span className="hover:underline text-blue-700">
                              {new Date(
                                inst.tempDueDate || inst.dueDate
                              ).toLocaleDateString("en-GB")}
                              {inst.tempDueDate && (
                                <span className="ml-1 text-xs text-orange-500">
                                  (unsaved)
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">₹{inst.amount}</td>
                        <td className="px-3 py-2">
                          <select
                            value={inst.status}
                            onChange={(e) =>
                              updateInstallmentStatus(
                                globalIndex,
                                e.target.value
                              )
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
                        <td className="px-3 py-2">
                          {inst.paidAt ? (
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
            {Math.ceil(rd.installments.length / itemsPerPage)}
          </span>
          <button
            onClick={() =>
              setPageInstallments((p) =>
                Math.min(
                  Math.ceil(rd.installments.length / itemsPerPage),
                  p + 1
                )
              )
            }
            disabled={
              pageInstallments ===
              Math.ceil(rd.installments.length / itemsPerPage)
            }
            className="p-1 border rounded disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Withdrawals Form */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 p-4 rounded-lg shadow-md mb-5 w-fit">
          <h4 className="font-semibold text-gray-700 mb-2">
            💸 Withdraw Amount
          </h4>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const amount = parseFloat(e.target.amount.value);
              const chequeNumber = e.target.chequeNumber.value.trim();
              const chequeDate = e.target.chequeDate.value;
              const notes = e.target.notes.value.trim();

              if (!amount || amount <= 0) {
                toast.error("Please enter a valid amount");
                return;
              }
              if (!chequeNumber || !chequeDate) {
                toast.error("Please enter cheque number and date");
                return;
              }

              try {
                const token = await getToken();
                await axios.put(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/rd/withdrawl/${rdId}`,
                  { amount, chequeNumber, chequeDate, notes },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success(`₹${amount.toFixed(2)} withdrawn successfully`);
                fetchRD();
                e.target.reset();
              } catch (err) {
                toast.error(err.response?.data?.error || "Withdrawal failed");
              }
            }}
            className="flex flex-wrap gap-3 items-end"
          >
            <div>
              <label className="text-sm text-gray-600 mr-3">Amount</label>
              <input
                type="number"
                name="amount"
                min="1"
                onWheel={(e) => e.target.blur()}
                className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-blue-300 outline-none"
                required
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
            <div>
              <label className="text-sm text-gray-600 mr-3">Notes</label>
              <input
                type="text"
                name="notes"
                className="border rounded px-2 py-1 w-40 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded shadow hover:from-blue-700 cursor-pointer hover:to-indigo-700"
            >
              Withdraw
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl border border-rose-200 shadow p-4">
          <h3 className="text-lg font-semibold text-rose-700 mb-3">
            💰 Withdrawal History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-rose-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Cheque No.</th>
                  <th className="px-3 py-2">Cheque Date</th>
                  <th className="px-3 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {paginate(rd.withdrawals || [], pageWithdrawals).map(
                  (w, idx) => (
                    <tr
                      key={idx}
                      className={`border-b text-center ${
                        idx % 2 === 0 ? "bg-rose-50/60" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-2">
                        {(pageWithdrawals - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-3 py-2">₹{w.amount.toFixed(2)}</td>
                      <td className="px-3 py-2">{w.chequeNumber || "-"}</td>
                      <td className="px-3 py-2">
                        {w.chequeDate
                          ? new Date(w.chequeDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{w.notes || "-"}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
