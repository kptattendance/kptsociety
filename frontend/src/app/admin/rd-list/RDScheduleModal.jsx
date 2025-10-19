"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function RDScheduleModal({ rdId, onClose }) {
  const { getToken } = useAuth();
  const [rd, setRD] = useState(null);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    chequeNumber: "",
    chequeDate: "",
    notes: "",
  });

  const fetchRD = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRD(res.data);
    } catch (err) {
      toast.error("Failed to fetch RD");
    }
  };

  useEffect(() => {
    if (rdId) fetchRD();
  }, [rdId]);

  const updateStatus = async (installmentNo, status) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/installment/${rdId}/${installmentNo}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Installment #${installmentNo} marked as ${status}`);
      fetchRD();
    } catch (err) {
      toast.error("Failed to update installment");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/withdrawl/${rdId}`,
        {
          amount: Number(withdrawForm.amount),
          chequeNumber: withdrawForm.chequeNumber,
          chequeDate: withdrawForm.chequeDate
            ? new Date(withdrawForm.chequeDate)
            : null,
          notes: withdrawForm.notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Withdrawal recorded successfully");
      setWithdrawForm({
        amount: "",
        chequeNumber: "",
        chequeDate: "",
        notes: "",
      });
      fetchRD();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to withdraw");
    }
  };

  if (!rd) return null;

  const totalWithdrawn =
    rd.withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;
  const balance = rd.totalDeposited - totalWithdrawn;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-[90%] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 bg-white rounded-full shadow hover:bg-gray-100"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-400 via-green-300 to-teal-400 text-white p-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-center">
            📅 RD Details – {rd.accountNumber}
          </h2>
        </div>

        {/* Installments Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto mt-4 p-4 bg-gradient-to-r from-violet-200 via-violet-100 to-pink-200 rounded-lg shadow-md">
          <h3 className="font-semibold text-teal-700 mb-3 text-lg">
            📅 Installment Schedule
          </h3>
          <table className="min-w-full border text-sm">
            <thead className="bg-gradient-to-r from-teal-200 via-teal-100 to-teal-200 text-gray-700">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Due Date</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {rd.installments.map((inst, idx) => (
                <tr
                  key={idx}
                  className={`border-b text-center hover:bg-gray-50 ${
                    inst.status === "Paid" ? "bg-green-50" : ""
                  }`}
                >
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">
                    {new Date(inst.dueDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-3 py-2">₹{inst.amount}</td>
                  <td className="px-3 py-2">
                    <select
                      value={inst.status}
                      onChange={(e) => updateStatus(idx + 1, e.target.value)}
                      className="border rounded px-2 py-1"
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
        </div>

        {/* Withdraw Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 via-green-100 to-green-50 rounded-lg shadow-md">
          {/* Withdraw Form */}
          <h3 className="font-semibold text-teal-700 mb-2 text-lg">
            💸 Withdraw from RD
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Available Balance:{" "}
            <span className="font-semibold">₹{balance.toLocaleString()}</span>
          </p>
          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4"
            onSubmit={handleWithdraw}
          >
            <input
              type="number"
              placeholder="Amount (₹)"
              value={withdrawForm.amount}
              onChange={(e) =>
                setWithdrawForm({ ...withdrawForm, amount: e.target.value })
              }
              className="border rounded px-2 py-1 focus:ring-2 focus:ring-teal-400 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Cheque Number"
              value={withdrawForm.chequeNumber}
              onChange={(e) =>
                setWithdrawForm({
                  ...withdrawForm,
                  chequeNumber: e.target.value,
                })
              }
              className="border rounded px-2 py-1 focus:ring-2 focus:ring-teal-400 outline-none"
            />
            <input
              type="date"
              value={withdrawForm.chequeDate}
              onChange={(e) =>
                setWithdrawForm({ ...withdrawForm, chequeDate: e.target.value })
              }
              className="border rounded px-2 py-1 focus:ring-2 focus:ring-teal-400 outline-none"
            />
            <input
              type="text"
              placeholder="Notes"
              value={withdrawForm.notes}
              onChange={(e) =>
                setWithdrawForm({ ...withdrawForm, notes: e.target.value })
              }
              className="border rounded px-2 py-1 focus:ring-2 focus:ring-teal-400 outline-none"
            />
            <button
              type="submit"
              className="col-span-1 md:col-span-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition"
            >
              Withdraw
            </button>
          </form>

          {/* Withdrawals Table */}
          {rd.withdrawals?.length > 0 && (
            <div className="overflow-x-auto max-h-48 overflow-y-auto mt-4">
              <h3 className="font-semibold text-teal-700 mb-2 text-lg">
                🧾 Withdrawal History
              </h3>
              <table className="min-w-full border text-sm">
                <thead className="bg-gradient-to-r from-teal-200 via-teal-100 to-teal-200 text-gray-700">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Cheque Number</th>
                    <th className="px-3 py-2">Cheque Date</th>
                    <th className="px-3 py-2">Withdrawn At</th>
                    <th className="px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rd.withdrawals.map((w, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 text-center"
                    >
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">₹{w.amount}</td>
                      <td className="px-3 py-2">{w.chequeNumber || "-"}</td>
                      <td className="px-3 py-2">
                        {w.chequeDate
                          ? new Date(w.chequeDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(w.withdrawnAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-3 py-2">{w.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
