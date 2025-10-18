"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function CDScheduleModal({ cdId, onClose }) {
  const { getToken } = useAuth();
  const [cd, setCD] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [pageInstallments, setPageInstallments] = useState(1);
  const [pageWithdrawals, setPageWithdrawals] = useState(1);
  const [pageDividends, setPageDividends] = useState(1);
  const itemsPerPage = 6;

  // Fetch CD data
  const fetchCD = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data);
      setCD(res.data);
    } catch (err) {
      toast.error("Failed to fetch CD data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cdId) fetchCD();
  }, [cdId]);

  // Update Installment Paid/Pending
  const updateInstallment = async (installmentNo, status) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/installment/${cdId}/${installmentNo}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Installment #${installmentNo} marked as ${status}`);
      fetchCD();
    } catch (err) {
      toast.error("Failed to update installment");
    }
  };

  // Partial withdrawal (1/3)
  const handlePartialWithdrawal = async () => {
    if (!confirm("Withdraw 1/3 of current balance?")) return;
    try {
      const token = await getToken();
      const amount = cd.totalDeposited / 3;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}/withdraw`,
        { amount, reason: "Partial Withdrawal" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`₹${amount.toFixed(2)} withdrawn successfully`);
      fetchCD();
    } catch (err) {
      toast.error(err.response?.data?.error || "Partial withdrawal failed");
    }
  };

  // Full withdrawal / Close CD
  const handleFullWithdrawal = async () => {
    if (!confirm("Withdraw full balance and close CD?")) return;
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Full balance withdrawn and CD closed");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Full withdrawal failed");
    }
  };

  if (!cd) return null;

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
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
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
                {cd.balance.toFixed(2)}
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
        {/* Installments Table */}
        {/* 🟢 INSTALLMENT SCHEDULE */}
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
                  (inst, idx) => (
                    <tr
                      key={idx}
                      className={`border-b text-center ${
                        idx % 2 === 0 ? "bg-teal-50/60" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-2">
                        {(pageInstallments - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(inst.dueDate).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2">₹{inst.amount}</td>
                      <td className="px-3 py-2">
                        <select
                          value={inst.status}
                          onChange={(e) =>
                            updateInstallment(
                              (pageInstallments - 1) * itemsPerPage + idx + 1,
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
                        {inst.paidAt
                          ? new Date(inst.paidAt).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

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
              }
            }}
            className="flex flex-wrap gap-3 items-end"
          >
            <div>
              <label className="text-sm text-gray-600 mr-3 ">Amount</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="1"
                className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-blue-300 outline-none"
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
                    <td className="px-3 py-2">₹{t.amount.toFixed(2)}</td>
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
                    <td className="px-3 py-2">₹{t.amount.toFixed(2)}</td>
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
