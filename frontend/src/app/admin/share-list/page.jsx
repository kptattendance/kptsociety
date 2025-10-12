"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import {
  Pencil,
  Trash2,
  Check,
  X,
  Lock,
  Eye,
  Search,
  FileDown,
} from "lucide-react";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";

import * as XLSX from "xlsx"; // ✅ Excel export library
import { saveAs } from "file-saver";

export default function AdminShareTable() {
  const { getToken } = useAuth();
  const [shares, setShares] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching Shares...");
  const [selectedShare, setSelectedShare] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const fetchShares = async () => {
    try {
      setLoading(true);
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

  const handleDelete = async (shareId) => {
    if (!confirm("Are you sure you want to delete this Share Account?")) return;
    try {
      setLoading(true);
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/${shareId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Share account deleted successfully");
      fetchShares();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete share account");
      setLoading(false);
    }
  };

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
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/${shareId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const handleClose = async (shareId) => {
    if (!confirm("Close this Share Account?")) return;
    try {
      setLoading(true);
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share/close/${shareId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Share account closed successfully");
      fetchShares();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("Failed to close share account");
      setLoading(false);
    }
  };

  // ✅ Excel Export
  const handleDownloadExcel = () => {
    if (!shares.length) return toast.warn("No share data to export");

    const data = shares.map((s, i) => ({
      "Sl No": i + 1,
      "Member Name": s.memberId?.name || "Unknown",
      Phone: s.memberId?.phone || "-",
      "Total Shares Purchased": s.totalSharesPurchased || 0,
      "Share Price (₹)": s.sharePrice || 0,
      "Total Amount (₹)": s.totalAmount || 0,
      Status: s.status || "Active",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shares");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      fileData,
      `Share_Accounts_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    toast.success("✅ Excel file downloaded");
  };

  // Filter and pagination
  const filteredShares = shares.filter((share) => {
    const search = searchTerm.toLowerCase();
    return (
      share.memberId?.name?.toLowerCase().includes(search) ||
      share.memberId?.phone?.toLowerCase().includes(search) ||
      share.status?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredShares.length / rowsPerPage);
  const paginatedShares = filteredShares.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-teal-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />

      <div className="bg-white shadow-xl justify-between items-center rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">
            🪙 Share Accounts
          </h2>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-4 justify-end mb-4">
          <div className="relative w-full md:w-1/3">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, phone, or status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FileDown size={18} /> Download Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-indigo-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Sl No</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Total Shares</th>
                <th className="px-4 py-2 text-left">Share Price (₹)</th>
                <th className="px-4 py-2 text-left">Total Amount (₹)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {!loading && filteredShares.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No share accounts found.
                  </td>
                </tr>
              )}

              {paginatedShares.map((share, index) => (
                <tr key={share._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-600">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

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

                  <td className="px-4 py-2 font-medium text-gray-700">
                    ₹{share.totalAmount?.toLocaleString()}
                  </td>

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
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {filteredShares.length > rowsPerPage && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }`}
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchase History Modal */}
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
