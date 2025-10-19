"use client";
import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function ShareDetailsModal({ share, onClose, refreshShares }) {
  console.log(share);
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
      setWithdrawalForm({
        date: "",
        sharesReturned: "",
        amountPaidOut: "",
        paymentMode: "",
        reference: "",
        notes: "",
      });
      refreshShares(); // Refresh the main table
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Failed to add withdrawal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          Share Details - {share.memberId?.name || "Unknown"}
        </h2>

        {/* Member Info */}
        <div className="mb-4 text-sm text-gray-700">
          <p>
            <strong>Phone:</strong> {share.memberId?.phone || "-"}
          </p>
          <p>
            <strong>Society Share Number:</strong>{" "}
            {share.societyShareNumber || "-"}
          </p>
          <p>
            <strong>Account Start Date:</strong>{" "}
            {share.accountStartDate
              ? new Date(share.accountStartDate).toLocaleDateString("en-GB")
              : "-"}
          </p>
          <p>
            <strong>Status:</strong> {share.status || "Active"}
          </p>
        </div>

        {/* Purchase History */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Purchase History</h3>
          {share.purchaseHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No purchases yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-300 text-sm">
              <thead className="bg-indigo-100 text-gray-700">
                <tr>
                  <th className="px-3 py-1 text-left">Start Date</th>
                  <th className="px-3 py-1 text-left">Shares Bought</th>
                  <th className="px-3 py-1 text-left">Amount (₹)</th>
                  <th className="px-3 py-1 text-left">Payment Mode</th>
                  <th className="px-3 py-1 text-left">Reference</th>
                  <th className="px-3 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {share.purchaseHistory.map((p, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1">
                      {share.accountStartDate
                        ? new Date(share.accountStartDate).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </td>
                    <td className="px-3 py-1">{p.sharesBought}</td>
                    <td className="px-3 py-1">{p.amountPaid}</td>
                    <td className="px-3 py-1">{p.paymentMode}</td>
                    <td className="px-3 py-1">{p.reference || "-"}</td>
                    <td className="px-3 py-1">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Withdrawal History</h3>
          {share.withdrawalHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">No withdrawals yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-300 text-sm">
              <thead className="bg-red-100 text-gray-700">
                <tr>
                  <th className="px-3 py-1 text-left">Date</th>
                  <th className="px-3 py-1 text-left">Shares Returned</th>
                  <th className="px-3 py-1 text-left">Amount Paid (₹)</th>
                  <th className="px-3 py-1 text-left">Payment Mode</th>
                  <th className="px-3 py-1 text-left">Reference</th>
                  <th className="px-3 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {share.withdrawalHistory.map((w, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1">
                      {new Date(w.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-1">{w.sharesReturned}</td>
                    <td className="px-3 py-1">{w.amountPaidOut}</td>
                    <td className="px-3 py-1">{w.paymentMode}</td>
                    <td className="px-3 py-1">{w.reference || "-"}</td>
                    <td className="px-3 py-1">{w.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add New Withdrawal */}
        <div className="mb-4 border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Plus size={16} /> Add Withdrawal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <input
              type="date"
              name="date"
              value={withdrawalForm.date}
              onChange={handleWithdrawalChange}
              className="border rounded-md px-2 py-1"
              placeholder="Withdrawal Date"
            />
            <input
              type="number"
              name="sharesReturned"
              value={withdrawalForm.sharesReturned}
              onChange={handleWithdrawalChange}
              className="border rounded-md px-2 py-1"
              placeholder="Shares Returned"
            />
            <input
              type="number"
              name="amountPaidOut"
              value={withdrawalForm.amountPaidOut}
              onChange={handleWithdrawalChange}
              className="border rounded-md px-2 py-1"
              placeholder="Amount Paid"
            />
            <input
              type="text"
              name="paymentMode"
              value={withdrawalForm.paymentMode}
              onChange={handleWithdrawalChange}
              className="border rounded-md px-2 py-1"
              placeholder="Payment Mode / Cash/ Online/ Cheque"
            />
            <input
              type="text"
              name="reference"
              value={withdrawalForm.reference}
              onChange={handleWithdrawalChange}
              className="border rounded-md px-2 py-1"
              placeholder="Cheque No."
            />
            <input
              type="text"
              name="notes"
              value={withdrawalForm.notes}
              onChange={handleWithdrawalChange}
              className="border rounded-md px-2 py-1"
              placeholder="Notes"
            />
          </div>
          <button
            onClick={handleAddWithdrawal}
            disabled={saving}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
          >
            Save Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}
