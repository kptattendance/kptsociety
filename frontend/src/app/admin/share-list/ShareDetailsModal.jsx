"use client";
import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function ShareDetailsModal({ share, onClose, refreshShares }) {
  const { getToken } = useAuth();
  const [withdrawalForm, setWithdrawalForm] = useState({
    date: "",
    sharesReturned: "",
    amountPaidOut: "",
    paymentMode: "",
    reference: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // 🟢 Local state to reflect updated withdrawals instantly
  const [localWithdrawals, setLocalWithdrawals] = useState(
    share.withdrawalHistory || []
  );

  if (!share) return null;

  const handleWithdrawalChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddWithdrawal = async () => {
    if (!withdrawalForm.date || !withdrawalForm.amountPaidOut) {
      return toast.error("Date and amount are required");
    }

    try {
      setSaving(true);
      const token = await getToken();

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/withdraw/${share._id}`,
        withdrawalForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Withdrawal recorded successfully");

      // ✅ Update local state to instantly reflect new record
      setLocalWithdrawals((prev) => [
        ...prev,
        res.data.updatedWithdrawal || withdrawalForm, // fallback if backend doesn't return updated data
      ]);

      // Reset form
      setWithdrawalForm({
        date: "",
        sharesReturned: "",
        amountPaidOut: "",
        paymentMode: "",
        reference: "",
        notes: "",
      });

      // Refresh main table as before
      refreshShares();
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Failed to add withdrawal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-2xl w-[90%] max-w-6xl p-6 relative overflow-y-auto max-h-[90vh] border border-indigo-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Share Account Details
          </h2>
          <p className="text-gray-600 mt-1">
            {share.memberId?.name || "Unknown Member"} (
            {share.societyShareNumber || "N/A"})
          </p>
        </div>

        {/* Member Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4 shadow-inner mb-6">
          <p>
            <strong>📞 Phone:</strong> {share.memberId?.phone || "-"}
          </p>
          <p>
            <strong>📅 Account Start Date:</strong>{" "}
            {share.accountStartDate
              ? new Date(share.accountStartDate).toLocaleDateString("en-GB")
              : "-"}
          </p>
          <p>
            <strong>🏦 Status:</strong>{" "}
            <span className="font-semibold text-indigo-700">
              {share.status || "Active"}
            </span>
          </p>
          <p>
            <strong>💰 Share Price:</strong> ₹{share.sharePrice}
          </p>
        </div>

        {/* Purchase History */}
        <div className="mb-8 bg-white/80 rounded-xl shadow-md p-4 border border-indigo-100">
          <h3 className="font-semibold text-lg mb-3 text-indigo-700 flex items-center gap-2">
            🟢 Purchase History
          </h3>
          {share.purchaseHistory.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No purchases yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-300 text-sm">
              <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Start Date</th>
                  <th className="px-3 py-2 text-left">Shares Bought</th>
                  <th className="px-3 py-2 text-left">Amount (₹)</th>
                  <th className="px-3 py-2 text-left">Payment Mode</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {share.purchaseHistory.map((p, i) => (
                  <tr key={i} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-3 py-2">
                      {share.accountStartDate
                        ? new Date(share.accountStartDate).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </td>
                    <td className="px-3 py-2">{p.sharesBought}</td>
                    <td className="px-3 py-2">₹{p.amountPaid}</td>
                    <td className="px-3 py-2">{p.paymentMode}</td>
                    <td className="px-3 py-2">{p.reference || "-"}</td>
                    <td className="px-3 py-2">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="mb-8 bg-white/80 rounded-xl shadow-md p-4 border border-red-100">
          <h3 className="font-semibold text-lg mb-3 text-red-700 flex items-center gap-2">
            🔴 Withdrawal History
          </h3>
          {localWithdrawals.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No withdrawals yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-300 text-sm">
              <thead className="bg-gradient-to-r from-rose-500 to-orange-400 text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Shares Returned</th>
                  <th className="px-3 py-2 text-left">Amount Paid (₹)</th>
                  <th className="px-3 py-2 text-left">Payment Mode</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {localWithdrawals.map((w, i) => (
                  <tr key={i} className="hover:bg-red-50 transition-colors">
                    <td className="px-3 py-2">
                      {new Date(w.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-2">{w.sharesReturned}</td>
                    <td className="px-3 py-2">₹{w.amountPaidOut}</td>
                    <td className="px-3 py-2">{w.paymentMode}</td>
                    <td className="px-3 py-2">{w.reference || "-"}</td>
                    <td className="px-3 py-2">{w.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add New Withdrawal */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-inner p-5">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-700">
            <Plus size={18} /> Add New Withdrawal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <input
              type="date"
              name="date"
              value={withdrawalForm.date}
              onChange={handleWithdrawalChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
              placeholder="Withdrawal Date"
            />
            <input
              type="number"
              name="sharesReturned"
              value={withdrawalForm.sharesReturned}
              onChange={handleWithdrawalChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
              placeholder="Shares Returned"
            />
            <input
              type="number"
              name="amountPaidOut"
              value={withdrawalForm.amountPaidOut}
              onChange={handleWithdrawalChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
              placeholder="Amount Paid"
            />
            <input
              type="text"
              name="paymentMode"
              value={withdrawalForm.paymentMode}
              onChange={handleWithdrawalChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
              placeholder="Payment Mode (Cash / Online / Cheque)"
            />
            <input
              type="text"
              name="reference"
              value={withdrawalForm.reference}
              onChange={handleWithdrawalChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
              placeholder="Cheque No."
            />
            <input
              type="text"
              name="notes"
              value={withdrawalForm.notes}
              onChange={handleWithdrawalChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-400"
              placeholder="Notes"
            />
          </div>

          <div className="text-right mt-5">
            <button
              onClick={handleAddWithdrawal}
              disabled={saving}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-105 disabled:opacity-50"
            >
              {saving ? "Saving..." : "💾 Save Withdrawal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
