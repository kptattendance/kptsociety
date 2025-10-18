"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-toastify";

export default function FDWithdrawalModal({ fd, onClose, onSuccess }) {
  const { getToken } = useAuth();
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    chequeNumber: "",
    chequeDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(withdrawData.amount);
    if (!amount || amount <= 0) return toast.warn("Enter a valid amount");
    if (amount > fd.principal)
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
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("❌ Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
        <h2 className="text-lg font-semibold text-indigo-700 mb-4">
          💸 FD Withdrawal - {fd.memberId?.name}
        </h2>

        <form onSubmit={handleWithdrawSubmit} className="space-y-3">
          <input
            type="number"
            placeholder="Withdrawal Amount (₹)"
            value={withdrawData.amount}
            onChange={(e) =>
              setWithdrawData({ ...withdrawData, amount: e.target.value })
            }
            required
            className="border w-full rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Cheque Number"
            value={withdrawData.chequeNumber}
            onChange={(e) =>
              setWithdrawData({ ...withdrawData, chequeNumber: e.target.value })
            }
            className="border w-full rounded-lg px-3 py-2"
          />

          <input
            type="date"
            placeholder="Cheque Date"
            value={withdrawData.chequeDate}
            onChange={(e) =>
              setWithdrawData({ ...withdrawData, chequeDate: e.target.value })
            }
            className="border w-full rounded-lg px-3 py-2"
          />

          <textarea
            placeholder="Reason (optional)"
            value={withdrawData.reason}
            onChange={(e) =>
              setWithdrawData({ ...withdrawData, reason: e.target.value })
            }
            className="border w-full rounded-lg px-3 py-2"
          />

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
