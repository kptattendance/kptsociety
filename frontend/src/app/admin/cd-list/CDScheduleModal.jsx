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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-teal-700 mb-4">
          📅 CD Account – {cd.accountNumber}
        </h2>

        <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
          <div>
            <p>
              <span className="font-medium">Member:</span>{" "}
              {cd.memberId?.name || "Unknown"}
            </p>
            <p>
              <span className="font-medium">Balance:</span> ₹
              {cd.balance.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`${
                  cd.status === "Active" ? "text-green-600" : "text-red-600"
                } font-semibold`}
              >
                {cd.status}
              </span>
            </p>
          </div>

          <div className="space-x-2">
            <button
              onClick={handlePartialWithdrawal}
              className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
            >
              1/3 Withdrawal
            </button>
            <button
              onClick={handleFullWithdrawal}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Full Withdrawal / Close
            </button>
          </div>
        </div>

        {/* Installments Table */}
        <h3 className="text-lg font-semibold text-teal-700 mb-2">
          🗓️ Installment Schedule
        </h3>
        <div className="overflow-x-auto mb-4">
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
              {paginate(cd.installments, pageInstallments).map((inst, idx) => (
                <tr key={idx} className="border-b text-center">
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
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalInstallmentPages > 1 && (
            <div className="flex justify-center items-center mt-2 space-x-2">
              <button
                onClick={() => setPageInstallments((p) => Math.max(1, p - 1))}
                disabled={pageInstallments === 1}
                className="p-1 border rounded disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">
                Page {pageInstallments} of {totalInstallmentPages}
              </span>
              <button
                onClick={() =>
                  setPageInstallments((p) =>
                    Math.min(totalInstallmentPages, p + 1)
                  )
                }
                disabled={pageInstallments === totalInstallmentPages}
                className="p-1 border rounded disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Withdrawals Table */}
        <h3 className="text-lg font-semibold text-teal-700 mb-2">
          💰 Withdrawal History
        </h3>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border text-sm">
            <thead className="bg-red-100 text-gray-700">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {paginate(withdrawals, pageWithdrawals).map((t, idx) => (
                <tr key={idx} className="border-b text-center">
                  <td className="px-3 py-2">
                    {(pageWithdrawals - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(t.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-3 py-2">₹{t.amount.toFixed(2)}</td>
                  <td className="px-3 py-2">{t.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalWithdrawalPages > 1 && (
            <div className="flex justify-center items-center mt-2 space-x-2">
              <button
                onClick={() => setPageWithdrawals((p) => Math.max(1, p - 1))}
                disabled={pageWithdrawals === 1}
                className="p-1 border rounded disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">
                Page {pageWithdrawals} of {totalWithdrawalPages}
              </span>
              <button
                onClick={() =>
                  setPageWithdrawals((p) =>
                    Math.min(totalWithdrawalPages, p + 1)
                  )
                }
                disabled={pageWithdrawals === totalWithdrawalPages}
                className="p-1 border rounded disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Dividends Table */}
        <h3 className="text-lg font-semibold text-teal-700 mb-2">
          💹 Dividend History
        </h3>
        <div className="overflow-x-auto mb-2">
          <table className="min-w-full border text-sm">
            <thead className="bg-green-100 text-gray-700">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginate(dividends, pageDividends).map((t, idx) => (
                <tr key={idx} className="border-b text-center">
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
          {totalDividendPages > 1 && (
            <div className="flex justify-center items-center mt-2 space-x-2">
              <button
                onClick={() => setPageDividends((p) => Math.max(1, p - 1))}
                disabled={pageDividends === 1}
                className="p-1 border rounded disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">
                Page {pageDividends} of {totalDividendPages}
              </span>
              <button
                onClick={() =>
                  setPageDividends((p) => Math.min(totalDividendPages, p + 1))
                }
                disabled={pageDividends === totalDividendPages}
                className="p-1 border rounded disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
