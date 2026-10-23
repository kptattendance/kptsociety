"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";
import LoadOverlay from "../../../components/LoadOverlay";
import { Pencil, Trash2, X } from "lucide-react"; // For cross icon
import ExportButtons from "../../../components/ExportButtons";
import { downloadExcel, fdSheets } from "../../../utils/excelExport";

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
  }, [fd?._id]);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawData.amount);
    if (!amount || amount <= 0) return toast.warn("Enter a valid amount");

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
  const handleDeleteWithdrawal = async (withdrawalId) => {
    if (!window.confirm("Are you sure you want to delete this withdrawal?"))
      return;

    try {
      setLoading(true);
      const token = await getToken(); // ✅ get token properly

      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fd._id}/withdrawal/${withdrawalId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message || "Withdrawal deleted successfully");
      fetchWithdrawals(); // ✅ refresh list
      refreshFDs(); // ✅ update FD data on main table
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 p-3 sm:p-4 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <LoadOverlay show={loading} message="Processing..." />

      <div className="relative w-full md:w-[75%] max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-white via-purple-50 to-pink-50 shadow-[0_0_60px_-15px_rgba(0,0,0,0.2)] border border-purple-100 p-4 sm:p-8 text-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn-close"
        >
          <X size={26} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
          💸 FD Withdrawal — {fd?.memberId?.name}
        </h2>
        <div className="flex justify-center -mt-3 mb-6">
          <ExportButtons
            fileName={`FD_${fd?.fdNumber}`}
            getSheets={() => fdSheets([{ ...fd, withdrawals }])}
          />
        </div>

        {/* FD Summary */}
        <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-purple-50 to-pink-50 shadow-inner border border-purple-200">
          <p className="text-base mb-2">
            💰{" "}
            <span className="font-medium text-purple-700">
              Principal Remaining:
            </span>{" "}
            ₹{Math.round(remainingPrincipal || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-base">
            📈{" "}
            <span className="font-medium text-purple-700">
              Updated Maturity Amount:
            </span>{" "}
            ₹{Math.round(Number(maturityAmount) || 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Withdrawal History */}
        <div className="overflow-x-auto max-h-56">
          <table className="min-w-full text-sm text-gray-700 rounded-xl">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50 sticky top-0 border-b border-blue-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Sl No</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Amount (₹)
                </th>
                <th className="px-3 py-2 text-left font-semibold">Cheque No</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Cheque Date
                </th>
                <th className="px-3 py-2 text-left font-semibold">Reason</th>
                <th className="px-3 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w, i) => (
                <tr
                  key={w._id}
                  className="hover:bg-pink-50 transition-colors duration-150"
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    ₹{Math.round(w.amount || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-3 py-2">{w.chequeNumber || "-"}</td>
                  <td className="px-3 py-2">
                    {w.chequeDate
                      ? new Date(w.chequeDate).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="px-3 py-2">{w.reason || "-"}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      onClick={() => handleDeleteWithdrawal(w._id)}
                      className="btn-icon btn-icon-delete"
                      title="Delete Withdrawal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New Withdrawal Form */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border border-purple-200 shadow-inner">
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
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-purple-200 focus:ring-2 focus:ring-blue-300 outline-none 
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
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-purple-200 focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <input
              type="date"
              placeholder="Cheque Date"
              value={withdrawData.chequeDate}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, chequeDate: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-purple-200 focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <textarea
              placeholder="Reason (optional)"
              value={withdrawData.reason}
              onChange={(e) =>
                setWithdrawData({ ...withdrawData, reason: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg text-gray-800 placeholder-gray-400 bg-white border border-purple-200 focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition font-medium text-gray-700 border cursor-pointer border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-accent btn-sm"
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
