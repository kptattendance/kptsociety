"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Check, X, Lock, Eye } from "lucide-react";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";

export default function AdminShareTable() {
  const { getToken } = useAuth();
  const [shares, setShares] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching Shares...");
  const [selectedShare, setSelectedShare] = useState(null);

  // ✅ Fetch all share accounts
  const fetchShares = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Fetching Shares...");
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShares(res.data);
    } catch (error) {
      console.error("Error fetching shares:", error);
      toast.error("Failed to load share records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  // ✅ Delete Share
  const handleDelete = async (shareId) => {
    if (!confirm("Are you sure you want to delete this Share Account?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Deleting share account...");
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/${shareId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Share account deleted successfully");
      fetchShares();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete share account");
      setLoading(false);
    }
  };

  // ✅ Edit Share
  const handleEditClick = (share) => {
    setEditingId(share._id);
    setEditForm({
      sharePrice: share.sharePrice,
      totalSharesPurchased: share.totalSharesPurchased,
      totalAmount: share.totalAmount,
      status: share.status,
    });
  };

  const handleSave = async (shareId) => {
    try {
      setLoading(true);
      setLoadingMessage("Updating share account...");
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/${shareId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Share account updated successfully");
      setEditingId(null);
      fetchShares();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update share account");
      setLoading(false);
    }
  };

  // ✅ Close Share
  const handleClose = async (shareId) => {
    if (!confirm("Close this Share Account?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Closing share account...");
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/close/${shareId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Share account closed successfully");
      fetchShares();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("Failed to close share account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-teal-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          🪙 Share Accounts
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-indigo-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Total Shares</th>
                <th className="px-4 py-2 text-left">Share Price (₹)</th>
                <th className="px-4 py-2 text-left">Total Amount (₹)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {!loading && shares.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No share accounts found.
                  </td>
                </tr>
              )}

              {shares.map((share) => (
                <tr key={share._id} className="hover:bg-gray-50">
                  {/* Member Info */}
                  <td className="px-4 py-2 flex items-center gap-3">
                    <img
                      src={share.memberId?.photo || "/default-avatar.png"}
                      alt={share.memberId?.name || "Member"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium">
                        {share.memberId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {share.memberId?.phone || "-"}
                      </p>
                    </div>
                  </td>

                  {/* Total Shares */}
                  <td className="px-4 py-2 font-medium text-gray-700">
                    {editingId === share._id ? (
                      <input
                        type="number"
                        value={editForm.totalSharesPurchased}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            totalSharesPurchased: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-20 text-center"
                      />
                    ) : (
                      share.totalSharesPurchased
                    )}
                  </td>

                  {/* Share Price */}
                  <td className="px-4 py-2">
                    {editingId === share._id ? (
                      <input
                        type="number"
                        value={editForm.sharePrice}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            sharePrice: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-20 text-center"
                      />
                    ) : (
                      `₹${share.sharePrice}`
                    )}
                  </td>

                  {/* Total Amount */}
                  <td className="px-4 py-2 font-medium text-gray-700">
                    ₹{share.totalAmount?.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2">
                    {editingId === share._id ? (
                      <select
                        value={editForm.status || "Active"}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="border rounded-md px-2 py-1"
                      >
                        <option>Active</option>
                        <option>Closed</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          share.status === "Closed"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {share.status || "Active"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2 space-x-2">
                    {editingId === share._id ? (
                      <>
                        <button
                          onClick={() => handleSave(share._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(share)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(share._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                        {share.status !== "Closed" && (
                          <button
                            onClick={() => handleClose(share._id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedShare(share)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Eye size={16} />
                          {/* View */}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Purchase History Modal */}
      {selectedShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[90%] md:w-[700px] p-6 relative">
            <button
              onClick={() => setSelectedShare(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-indigo-700 mb-4 text-center">
              Purchase History - {selectedShare.memberId?.name}
            </h3>

            {selectedShare.purchaseHistory?.length > 0 ? (
              <table className="min-w-full border text-sm">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="border px-3 py-2 text-left">Date</th>
                    <th className="border px-3 py-2 text-left">Shares</th>
                    <th className="border px-3 py-2 text-left">Amount (₹)</th>
                    <th className="border px-3 py-2 text-left">Mode</th>
                    <th className="border px-3 py-2 text-left">Reference</th>
                    <th className="border px-3 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedShare.purchaseHistory.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">
                        {p.date
                          ? new Date(p.date).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td className="border px-3 py-2">{p.sharesBought}</td>
                      <td className="border px-3 py-2">
                        ₹{p.amountPaid?.toLocaleString()}
                      </td>
                      <td className="border px-3 py-2">{p.paymentMode}</td>
                      <td className="border px-3 py-2">{p.reference || "-"}</td>
                      <td className="border px-3 py-2">{p.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 italic mt-3">
                No purchase records found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
