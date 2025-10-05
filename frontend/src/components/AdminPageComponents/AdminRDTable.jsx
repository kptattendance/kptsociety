"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Check, X, Lock } from "lucide-react";

export default function AdminRDTable() {
  const { getToken } = useAuth();
  const [rds, setRDs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch all RDs
  const fetchRDs = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRDs(res.data);
    } catch (error) {
      console.error("Error fetching RDs:", error);
    }
  };

  useEffect(() => {
    fetchRDs();
  }, []);

  // ✅ Delete RD
  const handleDelete = async (rdId) => {
    if (!confirm("Are you sure you want to delete this RD?")) return;
    try {
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("🗑️ RD deleted successfully");
      fetchRDs();
    } catch (error) {
      console.error("Delete failed:", error);
      setMessage("❌ Failed to delete RD");
    }
  };

  // ✅ Edit RD
  const handleEditClick = (rd) => {
    setEditingId(rd._id);
    setEditForm({
      depositAmount: rd.depositAmount,
      interestRate: rd.interestRate,
      tenureMonths: rd.tenureMonths,
      dueDayOfMonth: rd.dueDayOfMonth,
      gracePeriodDays: rd.gracePeriodDays,
      lateFeePerInstallment: rd.lateFeePerInstallment,
      notes: rd.notes || "",
      status: rd.status,
    });
  };

  const handleSave = async (rdId) => {
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setMessage("✅ RD updated successfully");
      fetchRDs();
    } catch (error) {
      console.error("Update failed:", error);
      setMessage("❌ Failed to update RD");
    }
  };

  // ✅ Close RD
  const handleClose = async (rdId) => {
    if (!confirm("Close this RD?")) return;
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/close/${rdId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ RD closed successfully");
      fetchRDs();
    } catch (error) {
      console.error("Close failed:", error);
      setMessage("❌ Failed to close RD");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-teal-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">
          💰 Recurring Deposit Records
        </h2>

        {message && (
          <div
            className={`mb-4 text-center font-medium ${
              message.includes("✅") || message.includes("🗑️")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-teal-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Deposit (₹)</th>
                <th className="px-4 py-2 text-left">Interest (%)</th>
                <th className="px-4 py-2 text-left">Tenure (Months)</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Maturity Date</th>
                <th className="px-4 py-2 text-left">Maturity Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {rds.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No RDs found.
                  </td>
                </tr>
              )}

              {rds.map((rd) => (
                <tr key={rd._id} className="hover:bg-gray-50">
                  {/* Member */}
                  <td className="px-4 py-2">
                    {rd.memberId?.name || "Unknown"}
                  </td>

                  {/* Deposit */}
                  <td className="px-4 py-2 font-medium text-gray-700">
                    ₹{rd.depositAmount?.toLocaleString()}
                  </td>

                  {/* Interest */}
                  <td className="px-4 py-2">
                    {editingId === rd._id ? (
                      <input
                        type="number"
                        value={editForm.interestRate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            interestRate: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-16 text-center"
                      />
                    ) : (
                      `${rd.interestRate}%`
                    )}
                  </td>

                  {/* Tenure */}
                  <td className="px-4 py-2">
                    {editingId === rd._id ? (
                      <input
                        type="number"
                        value={editForm.tenureMonths}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tenureMonths: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-20 text-center"
                      />
                    ) : (
                      rd.tenureMonths
                    )}
                  </td>

                  {/* Start Date */}
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(rd.startDate).toLocaleDateString("en-GB")}
                  </td>

                  {/* Maturity Date */}
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(rd.maturityDate).toLocaleDateString("en-GB")}
                  </td>

                  {/* Maturity Amount */}
                  <td className="px-4 py-2 font-medium text-gray-700">
                    ₹{rd.maturityAmount?.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2">
                    {editingId === rd._id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="border rounded-md px-2 py-1"
                      >
                        <option>Active</option>
                        <option>Matured</option>
                        <option>Closed</option>
                        <option>PreClosed</option>
                        <option>Defaulted</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rd.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : rd.status === "Closed" || rd.status === "Matured"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {rd.status}
                      </span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-2">
                    {editingId === rd._id ? (
                      <input
                        type="text"
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm({ ...editForm, notes: e.target.value })
                        }
                        className="border rounded-md px-2 py-1 w-full"
                      />
                    ) : (
                      rd.notes || "-"
                    )}
                  </td>

                  {/* Actions */}

                  <td className="px-4 py-2 text-center space-x-2">
                    {editingId === rd._id ? (
                      <>
                        <button
                          onClick={() => handleSave(rd._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(rd)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(rd._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                        {rd.status === "Active" && (
                          <button
                            onClick={() => handleClose(rd._id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Lock size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
