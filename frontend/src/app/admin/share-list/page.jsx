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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ShareDetailsModal from "./ShareDetailsModal";

export default function AdminShareTable() {
  const { getToken } = useAuth();
  const [shares, setShares] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching Shares...");
  const [selectedShare, setSelectedShare] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // ✅ Fetch shares
  const fetchShares = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  // ✅ Edit handlers
  const handleEditClick = (share) => {
    setEditingId(share._id);
    setEditForm({
      totalSharesPurchased: share.totalSharesPurchased,
      sharePrice: share.sharePrice,
      processingFee: share.processingFee || 0,
      totalAmount: share.totalAmount,
      societyShareNumber: share.societyShareNumber || "",
      accountStartDate: share.accountStartDate
        ? new Date(share.accountStartDate).toISOString().split("T")[0]
        : "",
      status: share.status || "Active",
    });
  };

  const handleSave = async (shareId) => {
    try {
      setLoading(true);
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

  const handleDelete = async (shareId) => {
    if (!confirm("Are you sure you want to delete this Share Account?")) return;
    try {
      setLoading(true);
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

  const handleClose = async (shareId) => {
    if (!confirm("Close this Share Account?")) return;
    try {
      setLoading(true);
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

  // ✅ Excel Export
  const handleDownloadExcel = () => {
    if (!shares.length) return toast.warn("No share data to export");

    const data = shares.map((s, i) => ({
      "Sl No": i + 1,
      "Member Name": s.memberId?.name || "Unknown",
      Phone: s.memberId?.phone || "-",
      "Society Share No": s.societyShareNumber || "-",
      "Start Date": s.accountStartDate
        ? new Date(s.accountStartDate).toLocaleDateString("en-GB")
        : "-",
      "Total Shares Purchased": s.totalSharesPurchased || 0,
      "Share Price (₹)": s.sharePrice || 0,
      "Processing Fee (₹)": s.processingFee || 0,
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

  // ✅ Filter & Pagination
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
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">
            🪙 Share Accounts
          </h2>
        </div>

        {/* Search + Excel */}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-indigo-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Sl No</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Society Share No</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Total Shares</th>
                <th className="px-4 py-2 text-left">Share Price (₹)</th>
                <th className="px-4 py-2 text-left">Processing Fee (₹)</th>
                <th className="px-4 py-2 text-left">Total Amount (₹)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedShares.map((share, index) => (
                <tr key={share._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-600">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>

                  {/* Member */}
                  <td className="px-4 py-2">
                    <p className="font-medium">
                      {share.memberId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {share.memberId?.phone || "-"}
                    </p>
                  </td>

                  {/* Editable Society Number */}
                  <td className="px-4 py-2">
                    {editingId === share._id ? (
                      <input
                        type="text"
                        value={editForm.societyShareNumber}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            societyShareNumber: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-24"
                      />
                    ) : (
                      share.societyShareNumber || "-"
                    )}
                  </td>

                  {/* Editable Start Date */}
                  <td className="px-4 py-2">
                    {editingId === share._id ? (
                      <input
                        type="date"
                        value={editForm.accountStartDate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            accountStartDate: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1"
                      />
                    ) : share.accountStartDate ? (
                      new Date(share.accountStartDate).toLocaleDateString(
                        "en-GB"
                      )
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Editable Shares */}
                  <td className="px-4 py-2">
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

                  {/* Editable Share Price */}
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

                  {/* Editable Fee */}
                  <td className="px-4 py-2">
                    {editingId === share._id ? (
                      <input
                        type="number"
                        value={editForm.processingFee}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            processingFee: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-20 text-center"
                      />
                    ) : (
                      `₹${share.processingFee || 0}`
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-2 font-medium text-gray-700">
                    ₹{share.totalAmount?.toLocaleString()}
                  </td>

                  {/* Editable Status */}
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
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Share Details Modal */}
          {selectedShare && (
            <ShareDetailsModal
              share={selectedShare}
              onClose={() => setSelectedShare(null)}
              refreshShares={fetchShares}
            />
          )}

          {/* Pagination */}
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
    </div>
  );
}
