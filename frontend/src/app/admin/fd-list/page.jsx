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
  const recordsPerPage = 6;

  const fetchFDs = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/fd`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fdsData = await Promise.all(
        res.data.map(async (fd) => {
          try {
            const wRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/fd/${fd._id}/withdrawals`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const totalWithdrawn = wRes.data.reduce(
              (sum, w) => sum + (Number(w.amount) || 0),
              0
            );
            return { ...fd, totalWithdrawn };
          } catch {
            return { ...fd, totalWithdrawn: 0 };
          }
        })
      );

      setFDs(fdsData);
    } catch (error) {
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
      notes: fd.notes || "",
    });
  };

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
        { headers: { Authorization: `Bearer ${token}` } }
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

    // ✅ Include FD Number + Total Withdrawn
    const exportData = fds.map((fd) => {
      // If backend already includes withdrawals array or totalWithdrawn
      const totalWithdrawn =
        fd.totalWithdrawn ??
        (Array.isArray(fd.withdrawals)
          ? fd.withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0)
          : 0);

      return {
        "FD No.": fd.fdNumber || "—",
        "Member Name": fd.memberId?.name || "Unknown",
        Phone: fd.memberId?.phone || "N/A",
        "Principal (₹)": fd.principal,
        "Total Withdrawn (₹)": totalWithdrawn || 0,
        "Interest Rate (%)": fd.interestRate,
        "Tenure (Months)": fd.tenureMonths,
        "Start Date": new Date(fd.startDate).toLocaleDateString("en-GB"),
        "Maturity Date": fd.maturityDate
          ? new Date(fd.maturityDate).toLocaleDateString("en-GB")
          : "-",
        "Maturity Amount (₹)": fd.maturityAmount || "-",
        Status: fd.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FD Records");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `FD_Records_${new Date().toISOString().slice(0, 10)}.xlsx`);

    toast.success("✅ FD records exported successfully!");
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
                <th className="px-4 py-2 text-left">FD No.</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Principal (₹)</th>
                <th className="px-4 py-2 text-left">Withdrawn (₹)</th>

                <th className="px-4 py-2 text-left">Interest (%)</th>
                <th className="px-4 py-2 text-left">Tenure (Months)</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Maturity Date</th>
                <th className="px-4 py-2 text-left">Maturity Amount (₹)</th>

                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Withdraw</th>
                <th className="px-4 py-2 text-center">Actions</th>
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
                currentRecords.map((fd) => (
                  <tr key={fd._id} className="hover:bg-gray-50">
                    {editingId === fd._id ? (
                      // ✅ Entire edit mode row
                      <>
                        {/* FD No. editable */}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editForm.fdNumber || fd.fdNumber || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                fdNumber: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>

                        {/* Member info (non-editable) */}
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

                        {/* Editable fields */}
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editForm.principal || fd.principal}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                principal: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="px-4 py-2 text-center text-gray-400">
                          {/* <td className="px-4 py-2 font-medium text-amber-700"> */}
                          ₹
                          {Array.isArray(fd.withdrawals) &&
                          fd.withdrawals.length > 0
                            ? fd.withdrawals
                                .reduce(
                                  (sum, w) => sum + (Number(w.amount) || 0),
                                  0
                                )
                                .toLocaleString()
                            : 0}
                        </td>

                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editForm.interestRate || fd.interestRate}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                interestRate: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editForm.tenureMonths || fd.tenureMonths}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                tenureMonths: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>

                        {/* Start Date */}
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={
                              editForm.startDate
                                ? editForm.startDate.slice(0, 10)
                                : fd.startDate
                                ? new Date(fd.startDate)
                                    .toISOString()
                                    .slice(0, 10)
                                : ""
                            }
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                startDate: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1"
                          />
                        </td>

                        {/* Read-only fields */}
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

                        {/* Status */}
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={editForm.status || fd.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                            className="border rounded px-2 py-1 w-20 text-center"
                          />
                        </td>

                        {/* Disabled withdraw */}
                        <td className="px-4 py-2 text-center text-gray-400">
                          —
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2 text-center flex space-x-2 justify-center">
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
                      </>
                    ) : (
                      // ✅ Normal display mode
                      <>
                        <td className="px-4 py-2 font-medium text-gray-700">
                          {fd.fdNumber || "—"}
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
                        <td className="px-4 py-2 font-medium text-gray-700">
                          ₹{fd.principal?.toLocaleString()}
                        </td>

                        <td className="px-4 py-2 font-medium text-amber-700">
                          ₹
                          {fd.totalWithdrawn
                            ? Number(fd.totalWithdrawn).toLocaleString()
                            : Array.isArray(fd.withdrawals)
                            ? fd.withdrawals
                                .reduce(
                                  (sum, w) => sum + (Number(w.amount) || 0),
                                  0
                                )
                                .toLocaleString()
                            : 0}
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
                        <td className="px-4 py-2">
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
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleWithdrawClick(fd)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <Wallet size={18} className="inline mr-1" />
                            Withdraw
                          </button>
                        </td>
                        <td className="px-4 py-2 text-center flex space-x-2 justify-center">
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
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 border rounded-lg"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded-lg ${
                  currentPage === i + 1 ? "bg-indigo-200" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 border rounded-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {withdrawModal && selectedFD && (
        <FDWithdrawalModal
          fd={selectedFD}
          onClose={() => setWithdrawModal(false)}
          refreshFDs={fetchFDs}
        />
      )}
    </div>
  );
}
