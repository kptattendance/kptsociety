"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Check, X, Lock, Wallet } from "lucide-react";
import Swal from "sweetalert2";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FDWithdrawalModal from "./FDWithdrawalModal";

export default function AdminFDTable() {
  const { getToken } = useAuth();
  const [fds, setFDs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Processing FDs...");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [selectedFD, setSelectedFD] = useState(null);
  const recordsPerPage = 15;

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

  const showConfirm = async (title, text) => {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });
    return result.isConfirmed;
  };

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

  const handleEditClick = (fd) => {
    setEditingId(fd._id);
    setEditForm({
      principal: fd.principal,
      interestRate: fd.interestRate,
      tenureMonths: fd.tenureMonths,
      status: fd.status,
    });
  };

  const handleSave = async (fdId) => {
    try {
      setLoading(true);
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fdId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingId(null);
      toast.success("✅ FD updated successfully");
      fetchFDs();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("❌ Failed to update FD");
    } finally {
      setLoading(false);
    }
  };

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("✅ FD closed successfully");
      fetchFDs();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("❌ Failed to close FD");
    }
  };

  const handleWithdrawClick = (fd) => {
    setSelectedFD(fd);
    setWithdrawModal(true);
  };

  const filteredFDs = fds.filter((fd) => {
    const name = fd.memberId?.name?.toLowerCase() || "";
    const phone = fd.memberId?.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  const totalPages = Math.ceil(filteredFDs.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredFDs.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDownloadExcel = () => {
    if (fds.length === 0) {
      toast.info("No data available to export!");
      return;
    }

    const exportData = fds.map((fd, index) => ({
      "SL No.": index + 1,
      "Member Name": fd.memberId?.name || "Unknown",
      Phone: fd.memberId?.phone || "N/A",
      "Principal (₹)": fd.principal,
      "Interest Rate (%)": fd.interestRate,
      "Tenure (Months)": fd.tenureMonths,
      "Start Date": new Date(fd.startDate).toLocaleDateString("en-GB"),
      "Maturity Date": fd.maturityDate
        ? new Date(fd.maturityDate).toLocaleDateString("en-GB")
        : "-",
      "Maturity Amount (₹)": fd.maturityAmount || "-",
      Status: fd.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FD Records");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `FD_Records_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          💼 Fixed Deposit Records
        </h2>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow"
          >
            📥 Download Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-indigo-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">SL No.</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Principal (₹)</th>
                <th className="px-4 py-2 text-left">Interest (%)</th>
                <th className="px-4 py-2 text-left">Tenure (Months)</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Maturity Date</th>
                <th className="px-4 py-2 text-left">Maturity Amount (₹)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
                <th className="px-4 py-2 text-center">Withdraw</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {currentRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No Fixed Deposits found.
                  </td>
                </tr>
              ) : (
                currentRecords.map((fd, index) => (
                  <tr key={fd._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-4 py-2 flex items-center space-x-3">
                      <img
                        src={fd.memberId?.photo || "/default-avatar.png"}
                        alt="member"
                        className="w-8 h-8 rounded-full border"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {fd.memberId?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          📞 {fd.memberId?.phone || "N/A"}
                        </div>
                      </div>
                    </td>

                    {editingId === fd._id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editForm.principal}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                principal: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editForm.interestRate}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                interestRate: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-16"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editForm.tenureMonths}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                tenureMonths: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-16"
                          />
                        </td>
                        <td className="px-4 py-2">
                          {new Date(fd.startDate).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-2">
                          {fd.maturityDate
                            ? new Date(fd.maturityDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-2 font-medium text-green-700">
                          ₹{fd.maturityAmount?.toLocaleString() || "-"}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-20 text-center"
                          />
                        </td>
                        <td className="px-4 py-2 text-center space-x-2 flex justify-center">
                          <button
                            onClick={() => handleSave(fd._id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        </td>
                        <td className="px-4 py-2 text-center text-gray-400 italic">
                          -
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 font-medium text-gray-700">
                          ₹{fd.principal?.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{fd.interestRate}%</td>
                        <td className="px-4 py-2">{fd.tenureMonths}</td>
                        <td className="px-4 py-2 text-gray-600">
                          {new Date(fd.startDate).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {fd.maturityDate
                            ? new Date(fd.maturityDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-2 font-medium text-green-700">
                          ₹{fd.maturityAmount?.toLocaleString() || "-"}
                        </td>
                        <td className="px-4 py-2">{fd.status}</td>

                        <td className="px-4 py-2 text-center space-x-2 flex justify-center">
                          <button
                            onClick={() => handleEditClick(fd)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(fd._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          {fd.status === "Active" && (
                            <button
                              onClick={() => handleClose(fd._id)}
                              className="text-gray-600 hover:text-gray-800"
                              title="Close FD"
                            >
                              <Lock size={18} />
                            </button>
                          )}
                        </td>

                        {/* ✅ Withdraw column */}
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleWithdrawClick(fd)}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Withdraw"
                          >
                            <Wallet size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Withdrawal Modal */}
      {withdrawModal && selectedFD && (
        <FDWithdrawalModal
          fd={selectedFD}
          onClose={() => setWithdrawModal(false)}
          onSuccess={fetchFDs}
        />
      )}
    </div>
  );
}
