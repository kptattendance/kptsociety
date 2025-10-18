"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Lock, Search, Pencil, Check, X } from "lucide-react";
import LoadOverlay from "../../../components/LoadOverlay";
import CDScheduleModal from "./CDScheduleModal";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminCDList() {
  const { getToken } = useAuth();
  const [cds, setCDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching CDs...");
  const [selectedCDId, setSelectedCDId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ startDate: "", monthlyDeposit: "", status: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  // ✅ Fetch all CDs
  const fetchCDs = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Fetching CDs...");
      const token = await getToken();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCDs(res.data);
    } catch (error) {
      console.error("Error fetching CDs:", error);
      toast.error("Failed to fetch CDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCDs();
  }, []);

  // ✅ Filter CDs
  const filteredCDs = cds.filter((cd) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      cd.memberId?.name?.toLowerCase().includes(lowerSearch) ||
      cd.memberId?.phone?.toLowerCase().includes(lowerSearch) ||
      cd.accountNumber?.toLowerCase().includes(lowerSearch)
    );
  });

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredCDs.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredCDs.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ Delete CD
  const handleDelete = async (cdId) => {
    if (!confirm("Are you sure you want to delete this CD?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Deleting CD...");
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("CD deleted successfully");
      fetchCDs();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete CD");
      setLoading(false);
    }
  };

  // ✅ Close CD
  const handleClose = async (cdId) => {
    if (!confirm("Close this CD account?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Closing CD...");
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("CD closed successfully");
      fetchCDs();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("Failed to close CD");
      setLoading(false);
    }
  };

  // ✅ Edit Mode Handlers
  const handleEdit = (cd) => {
    setEditId(cd._id);
    setEditData({
      startDate: cd.startDate ? cd.startDate.slice(0, 10) : "",
      monthlyDeposit: cd.monthlyDeposit,
      status: cd.status,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (cdId) => {
    try {
      setLoading(true);
      setLoadingMessage("Updating CD...");
      const token = await getToken();
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("CD updated successfully");
      setEditId(null);
      fetchCDs();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update CD");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setEditData({ startDate: "", monthlyDeposit: "", status: "" });
  };

  // ✅ Refresh when modal closes
  const handleModalClose = (updated = false) => {
    setSelectedCDId(null);
    if (updated) fetchCDs();
  };

  const handleDownloadExcel = () => {
    if (cds.length === 0) {
      toast.info("No data available to export!");
      return;
    }

    const exportData = cds.map((cd, index) => ({
      "SL No.": index + 1,
      "Account Number": cd.accountNumber || "-",
      "Member Name": cd.memberId?.name || "Unknown",
      "Phone Number": cd.memberId?.phone || "N/A",
      "Monthly Deposit (₹)": cd.monthlyDeposit?.toLocaleString() || "0",
      "Total Deposited (₹)": cd.totalDeposited?.toLocaleString() || "0",
      "Total Withdrawn (₹)": cd.totalWithdrawn?.toLocaleString() || "0",
      "Balance (₹)": cd.balance?.toLocaleString() || "0",
      Status: cd.status || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CD Records");
    worksheet["!cols"] = Object.keys(exportData[0]).map(() => ({ wch: 20 }));

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `CD_Records_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-50 to-pink-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">💰 CD Accounts</h2>

        {/* 🔍 Search + Download */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, or account #"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow"
          >
            📥 Download Excel
          </button>
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-teal-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">SL No.</th>
                <th className="px-4 py-2 text-left">Account #</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Monthly Deposit (₹)</th>
                <th className="px-4 py-2 text-left">Total Deposited</th>
                <th className="px-4 py-2 text-left">Total Withdrawn</th>
                <th className="px-4 py-2 text-left">Balance</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
                <th className="px-4 py-2 text-center">Schedule</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {!loading && currentRecords.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500 italic">
                    No CD accounts found.
                  </td>
                </tr>
              )}

              {currentRecords.map((cd, index) => (
                <tr key={cd._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-600">{startIndex + index + 1}</td>
                  <td className="px-4 py-2 font-medium">{cd.accountNumber}</td>

                  <td className="px-4 py-2 flex items-center gap-3">
                    <img
                      src={cd.memberId?.photo || "/default-avatar.png"}
                      alt={cd.memberId?.name || "Member"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium">{cd.memberId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{cd.memberId?.phone || "-"}</p>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    {editId === cd._id ? (
                      <input
                        type="date"
                        name="startDate"
                        value={editData.startDate}
                        onChange={handleEditChange}
                        className="border rounded-md px-2 py-1 w-full"
                      />
                    ) : cd.startDate ? (
                      new Date(cd.startDate).toLocaleDateString()
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-4 py-2">
                    {editId === cd._id ? (
                      <input
                        type="number"
                        name="monthlyDeposit"
                        value={editData.monthlyDeposit}
                        onChange={handleEditChange}
                        className="border rounded-md px-2 py-1 w-28"
                      />
                    ) : (
                      `₹${cd.monthlyDeposit?.toLocaleString()}`
                    )}
                  </td>

                  <td className="px-4 py-2">₹{cd.totalDeposited?.toLocaleString()}</td>
                  <td className="px-4 py-2">₹{cd.totalWithdrawn?.toLocaleString()}</td>
                  <td className="px-4 py-2">₹{cd.balance?.toLocaleString()}</td>

                  <td className="px-4 py-2">
                    {editId === cd._id ? (
                      <select
                        name="status"
                        value={editData.status}
                        onChange={handleEditChange}
                        className="border rounded-md px-2 py-1"
                      >
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cd.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : cd.status === "Closed"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {cd.status}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-2 text-center space-x-2">
                    {editId === cd._id ? (
                      <>
                        <button onClick={() => handleSave(cd._id)} className="text-green-600 hover:text-green-800">
                          <Check size={16} />
                        </button>
                        <button onClick={handleCancel} className="text-gray-600 hover:text-gray-800">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(cd)} className="text-blue-600 hover:text-blue-800">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(cd._id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                        {cd.status === "Active" && (
                          <button onClick={() => handleClose(cd._id)} className="text-gray-600 hover:text-gray-800">
                            <Lock size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedCDId(cd._id)}
                      className="text-teal-500 cursor-pointer hover:text-green-700 font-medium"
                    >
                      Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedCDId && <CDScheduleModal cdId={selectedCDId} onClose={handleModalClose} />}
        </div>

        {/* ✅ Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-teal-50 disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded-md border text-sm ${
                  currentPage === i + 1 ? "bg-teal-500 text-white" : "bg-white hover:bg-teal-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-teal-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
