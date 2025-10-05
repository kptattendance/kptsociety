"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Check, X, Lock } from "lucide-react";
import Swal from "sweetalert2";
import LoadOverlay from "../../../components/LoadOverlay"; // ✅ Import overlay

import { toast } from "react-toastify";

export default function AdminFDTable() {
  const { getToken } = useAuth();
  const [fds, setFDs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Processing FDs...");

  // ✅ Fetch all FDs
  const fetchFDs = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/fd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFDs(res.data);
    } catch (error) {
      console.error("Error fetching FDs:", error);
      toast.error("❌ Failed to load FDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFDs();
  }, []);

  // ✅ Custom Confirm Dialog
  const showConfirm = async (title, text) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb", // blue
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });
    return result.isConfirmed;
  };

  // ✅ Delete FD
  const handleDelete = async (fdId) => {
    const confirmed = await showConfirm(
      "Delete FD?",
      "This action cannot be undone!"
    );
    if (!confirmed) return;
    try {
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("🗑️ FD deleted successfully");
      fetchFDs();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("❌ Failed to delete FD");
    }
  };

  // ✅ Edit FD
  const handleEditClick = (fd) => {
    setEditingId(fd._id);
    setEditForm({
      interestRate: fd.interestRate,
      tenureMonths: fd.tenureMonths,
      notes: fd.notes || "",
      status: fd.status,
    });
  };

  // ✅ Save FD
  const handleSave = async (fdId) => {
    try {
      setLoading(true);
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fdId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      toast.success("✅ FD updated successfully");
      fetchFDs();
      setLoading(true);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("❌ Failed to update FD");
      setLoading(true);
    }
  };

  // ✅ Close FD
  const handleClose = async (fdId) => {
    const confirmed = await showConfirm(
      "Close FD?",
      "This will mark the FD as closed."
    );
    if (!confirmed) return;
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fdId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ FD closed successfully");
      fetchFDs();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("❌ Failed to close FD");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          💼 Fixed Deposit Records
        </h2>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6 text-indigo-600 animate-pulse">
              Loading Fixed Deposits...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-300 text-sm">
              <thead className="bg-indigo-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Member</th>
                  <th className="px-4 py-2 text-left">Principal (₹)</th>
                  <th className="px-4 py-2 text-left">Interest (%)</th>
                  <th className="px-4 py-2 text-left">Tenure (Months)</th>
                  <th className="px-4 py-2 text-left">Start Date</th>
                  <th className="px-4 py-2 text-left">Maturity Date</th>
                  <th className="px-4 py-2 text-left">Maturity Amount (₹)</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {fds.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-4 text-gray-500 italic"
                    >
                      No Fixed Deposits found.
                    </td>
                  </tr>
                ) : (
                  fds.map((fd) => (
                    <tr key={fd._id} className="hover:bg-gray-50">
                      {/* Member */}
                      <td className="px-4 py-2">
                        {fd.memberId?.name || "Unknown"}
                      </td>

                      {/* Principal */}
                      <td className="px-4 py-2 font-medium text-gray-700">
                        ₹{fd.principal?.toLocaleString()}
                      </td>

                      {/* Interest Rate */}
                      <td className="px-4 py-2">
                        {editingId === fd._id ? (
                          <input
                            type="number"
                            name="interestRate"
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
                          `${fd.interestRate}%`
                        )}
                      </td>

                      {/* Tenure */}
                      <td className="px-4 py-2">
                        {editingId === fd._id ? (
                          <input
                            type="number"
                            name="tenureMonths"
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
                          fd.tenureMonths
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(fd.startDate).toLocaleDateString("en-GB")}
                      </td>

                      {/* Maturity Date */}
                      <td className="px-4 py-2 text-gray-600">
                        {fd.maturityDate
                          ? new Date(fd.maturityDate).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </td>

                      {/* Maturity Amount */}
                      <td className="px-4 py-2 font-medium text-green-700">
                        ₹
                        {fd.maturityAmount
                          ? Number(fd.maturityAmount).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "-"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2">
                        {editingId === fd._id ? (
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                            className="border rounded-md px-2 py-1"
                          >
                            <option>Active</option>
                            <option>Matured</option>
                            <option>PreClosed</option>
                            <option>Closed</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              fd.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : fd.status === "Closed"
                                ? "bg-gray-200 text-gray-600"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {fd.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-center space-x-2">
                        {editingId === fd._id ? (
                          <>
                            <button
                              onClick={() => handleSave(fd._id)}
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
                              onClick={() => handleEditClick(fd)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(fd._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                            {fd.status === "Active" && (
                              <button
                                onClick={() => handleClose(fd._id)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <Lock size={18} />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
