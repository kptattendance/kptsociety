"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";
import LoadOverlay from "../../../components/LoadOverlay";
import { X } from "lucide-react"; // For cross icon

export default function FDWithdrawalModal({ fd, onClose, refreshFDs }) {
  const { getToken } = useAuth();
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    chequeNumber: "",
    chequeDate: "",
    reason: "",
  });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remainingPrincipal, setRemainingPrincipal] = useState(
    fd?.principal || 0
  );
  const [maturityAmount, setMaturityAmount] = useState(fd?.maturityAmount || 0);

  // Fetch past withdrawals
  const fetchWithdrawals = async () => {
    if (!fd) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fd._id}/withdrawals`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWithdrawals(res.data);

      setRemainingPrincipal(fd.principal);

      const years = fd.tenureMonths / 12;
      const newMaturity =
        remainingPrincipal * Math.pow(1 + fd.interestRate / 100, years);
      setMaturityAmount(newMaturity.toFixed(2));
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("❌ Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [fd]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawData.amount);
    if (!amount || amount <= 0) return toast.warn("Enter a valid amount");
    if (amount > remainingPrincipal)
      return toast.error("Withdrawal exceeds available balance");

    try {
      setLoading(true);
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fd._id}/withdraw`,
        {
          amount,
          chequeNumber: withdrawData.chequeNumber,
          chequeDate: withdrawData.chequeDate,
          reason: withdrawData.reason,
          paymentMode: "Cheque",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("💸 Withdrawal successful!");

      setWithdrawData({
        amount: "",
        chequeNumber: "",
        chequeDate: "",
        reason: "",
      });
      fetchWithdrawals();
      refreshFDs();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("❌ Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <LoadOverlay show={loading} message="Processing..." />
      <div className="relative rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-[90%] md:w-[60%] bg-gray-50 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>

        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          💸 FD Withdrawal - {fd?.memberId?.name}
        </h2>

        {/* FD Summary */}
        <div className="mb-4 p-4 rounded-lg shadow-sm text-white bg-gradient-to-r from-green-400 to-blue-500">
          <p>💰 Principal Remaining: ₹{remainingPrincipal?.toLocaleString()}</p>
          <p>
            📈 Updated Maturity Amount: ₹
            {Number(maturityAmount).toLocaleString()}
          </p>
        </div>

        {/* Past withdrawals */}
        <div className="mb-4 p-4 rounded-lg shadow-sm text-white bg-gradient-to-r from-pink-400 to-purple-500">
          <h3 className="font-medium mb-2">Withdrawal History</h3>
          {withdrawals.length === 0 ? (
            <p className="text-sm italic">No withdrawals yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-52">
              <table className="min-w-full divide-y divide-gray-200 text-sm bg-white text-black rounded">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left">Sl No</th>
                    <th className="px-2 py-1 text-left">Amount (₹)</th>
                    <th className="px-2 py-1 text-left">Cheque No</th>
                    <th className="px-2 py-1 text-left">Cheque Date</th>
                    <th className="px-2 py-1 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w, i) => (
                    <tr key={i} className="hover:bg-gray-100">
                      <td className="px-2 py-1">{i + 1}</td>
                      <td className="px-2 py-1">
                        ₹{w.amount.toLocaleString()}
                      </td>
                      <td className="px-2 py-1">{w.chequeNumber || "-"}</td>
                      <td className="px-2 py-1">
                        {w.chequeDate
                          ? new Date(w.chequeDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="px-2 py-1">{w.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New withdrawal form */}
        <div className="p-4 rounded-lg shadow-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <form onSubmit={handleWithdrawSubmit} className="space-y-3">
            <input
              type="number"
              placeholder="Withdrawal Amount (₹)"
              value={withdrawData.amount}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, amount: e.target.value })
              }
              required
              className="border w-full rounded-lg px-3 py-2 text-black"
            />
            <input
              type="text"
              placeholder="Cheque Number"
              value={withdrawData.chequeNumber}
              onChange={(e) =>
                setWithdrawData({
                  ...withdrawData,
                  chequeNumber: e.target.value,
                })
              }
              className="border w-full rounded-lg px-3 py-2 text-black"
            />
            <input
              type="date"
              placeholder="Cheque Date"
              value={withdrawData.chequeDate}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, chequeDate: e.target.value })
              }
              className="border w-full rounded-lg px-3 py-2 text-black"
            />
            <textarea
              placeholder="Reason (optional)"
              value={withdrawData.reason}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, reason: e.target.value })
              }
              className="border w-full rounded-lg px-3 py-2 text-black"
            />
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-800 text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white"
              >
                Withdraw
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
