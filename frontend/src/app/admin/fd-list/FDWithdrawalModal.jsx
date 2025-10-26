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
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <LoadOverlay show={loading} message="Processing..." />

      <div className="relative w-[92%] md:w-[75%] max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-white via-[#faf8f5] to-[#f7f4ef] shadow-[0_0_60px_-15px_rgba(0,0,0,0.2)] border border-[#f1e9dd] p-8 text-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-red-500 transition"
        >
          <X size={26} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-[#c8a75e] via-[#d4af37] to-[#b8860b] bg-clip-text text-transparent drop-shadow-sm">
          💸 FD Withdrawal — {fd?.memberId?.name}
        </h2>

        {/* FD Summary */}
        <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-[#fdf7ef] to-[#fff5dc] shadow-inner border border-[#f0e3c2]">
          <p className="text-base mb-2">
            💰{" "}
            <span className="font-medium text-[#b8860b]">
              Principal Remaining:
            </span>{" "}
            ₹{remainingPrincipal?.toLocaleString()}
          </p>
          <p className="text-base">
            📈{" "}
            <span className="font-medium text-[#b8860b]">
              Updated Maturity Amount:
            </span>{" "}
            ₹{Number(maturityAmount).toLocaleString()}
          </p>
        </div>

        {/* Withdrawal History */}
        <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-[#f8f5ee] via-[#fdf8f2] to-[#fffefb] shadow-inner border border-[#eee2c5]">
          <h3 className="font-semibold text-lg mb-3 text-[#b8860b]">
            Withdrawal History
          </h3>
          {withdrawals.length === 0 ? (
            <p className="italic text-sm text-gray-500">No withdrawals yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-56">
              <table className="min-w-full text-sm text-gray-700 rounded-xl">
                <thead className="bg-gradient-to-r from-[#fff3d9] to-[#fffaed] sticky top-0 border-b border-[#e9d6a4]">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Sl No</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Amount (₹)
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Cheque No
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Cheque Date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[#fffaf0] transition-colors duration-150"
                    >
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">
                        ₹{w.amount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{w.chequeNumber || "-"}</td>
                      <td className="px-3 py-2">
                        {w.chequeDate
                          ? new Date(w.chequeDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{w.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New Withdrawal Form */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#fff6e5] via-[#fff9ef] to-[#fffdf7] border border-[#f0e3c2] shadow-inner">
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <input
              type="number"
              placeholder="Withdrawal Amount (₹)"
              value={withdrawData.amount}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, amount: e.target.value })
              }
              onWheel={(e) => e.target.blur()} // 👈 Prevent scroll change
              required
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-[#f0e3c2] focus:ring-2 focus:ring-[#d4af37]/50 outline-none 
             appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-[#f0e3c2] focus:ring-2 focus:ring-[#d4af37]/50 outline-none"
            />
            <input
              type="date"
              placeholder="Cheque Date"
              value={withdrawData.chequeDate}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, chequeDate: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-[#f0e3c2] focus:ring-2 focus:ring-[#d4af37]/50 outline-none"
            />
            <textarea
              placeholder="Reason (optional)"
              value={withdrawData.reason}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, reason: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-[#f0e3c2] focus:ring-2 focus:ring-[#d4af37]/50 outline-none"
            />
            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-[#f8f3e4] hover:bg-[#f1e8cf] transition font-medium text-gray-700 border cursor-pointer border-[#e8d6a5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#caa434] hover:from-[#e0b949] cursor-pointer hover:to-[#d4af37] transition font-semibold text-white shadow-md"
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
