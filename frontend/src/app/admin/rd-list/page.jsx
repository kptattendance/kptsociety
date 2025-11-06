"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Check, X, Lock, ArrowUpDown } from "lucide-react";
import RDScheduleModal from "./RDScheduleModal";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminRDTable() {
  const { getToken } = useAuth();
  const [rds, setRDs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching RDs...");
  const [selectedRDId, setSelectedRDId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        // Default ascending on new column
        return { key, direction: "asc" };
      }
    });
  };

  // Fetch RDs
  const fetchRDs = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Fetching RDs...");
      const token = await getToken();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRDs(res.data);
    } catch (error) {
      console.error("Error fetching RDs:", error);
      toast.error("Failed to fetch RDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRDs();
  }, []);

  // Delete RD
  const handleDelete = async (rdId) => {
    if (!confirm("Are you sure you want to delete this RD?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Deleting RD...");
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("RD deleted successfully");
      fetchRDs();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete RD");
      setLoading(false);
    }
  };

  // Edit RD
  const handleEditClick = (rd) => {
    setEditingId(rd._id);
    setEditForm({
      accountNumber: rd.accountNumber || "",
      depositAmount: rd.depositAmount || "",
      interestRate: rd.interestRate || "",
      tenureMonths: rd.tenureMonths || "",
      startDate: rd.startDate ? rd.startDate.slice(0, 10) : "",
      initialDeposit: rd.initialDeposit || "", // ✅ add this
      initialDepositDate: rd.initialDepositDate
        ? rd.initialDepositDate.slice(0, 10)
        : "", // ✅ add this
      dueDayOfMonth: rd.dueDayOfMonth || "",
      gracePeriodDays: rd.gracePeriodDays || "",
      lateFeePerInstallment: rd.lateFeePerInstallment || "",
      notes: rd.notes || "",
      status: rd.status,
    });
  };

  const handleSave = async (rdId) => {
    if (
      !editForm.accountNumber ||
      !editForm.depositAmount ||
      !editForm.interestRate
    ) {
      toast.error(
        "Account Number, Deposit Amount, and Interest Rate are required!"
      );
      return;
    }
    try {
      setLoading(true);
      setLoadingMessage("Updating RD...");
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingId(null);
      toast.success("RD updated successfully");
      fetchRDs();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update RD");
      setLoading(false);
    }
  };

  // Close RD
  const handleClose = async (rdId) => {
    if (!confirm("Close this RD?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Closing RD...");
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/close/${rdId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("RD closed successfully");
      fetchRDs();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("Failed to close RD");
      setLoading(false);
    }
  };

  // Download Excel
  const handleDownloadExcel = () => {
    if (!rds.length) {
      toast.info("No data available to export!");
      return;
    }

    const exportData = rds.map((rd, index) => {
      const totalWithdrawn =
        rd.withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
      rd.availableBalance = (rd.totalDeposited || 0) - totalWithdrawn;

      return {
        "Sl. No.": index + 1,
        "Account Number": rd.accountNumber || "-",
        "Member Name": rd.memberId?.name || "Unknown",
        "Phone Number": rd.memberId?.phone || "N/A",
        "Deposit Amount (₹)": Math.round(rd.depositAmount || 0),
        "Total Deposited (₹)": Math.round(rd.totalDeposited || 0),
        "Total Withdrawn (₹)": Math.round(totalWithdrawn),
        "Available Balance (₹)": Math.round(rd.availableBalance),
        "Interest Rate (%)": rd.interestRate || 0,
        "Tenure (Months)": rd.tenureMonths || 0,
        "Start Date": rd.startDate
          ? new Date(rd.startDate).toLocaleDateString("en-GB")
          : "-",
        "Maturity Date": rd.maturityDate
          ? new Date(rd.maturityDate).toLocaleDateString("en-GB")
          : "-",
        "Maturity Amount (₹)": Math.round(rd.maturityAmount || 0),

        Status: rd.status || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RD Records");
    worksheet["!cols"] = Object.keys(exportData[0]).map(() => ({ wch: 20 }));
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `RD_Records_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("✅ Excel file downloaded");
  };

  // Filtered and sorted RDs
  const filteredRDs = rds.filter((rd) => {
    const name = rd.memberId?.name?.toLowerCase() || "";
    const phone = rd.memberId?.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  const sortedRDs = [...filteredRDs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = "";
    let bValue = "";

    if (sortConfig.key === "accountNumber") {
      aValue = a.accountNumber || "";
      bValue = b.accountNumber || "";
    } else if (sortConfig.key === "memberName") {
      aValue = a.memberId?.name?.toLowerCase() || "";
      bValue = b.memberId?.name?.toLowerCase() || "";
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedRDs.length / rowsPerPage);
  const paginatedRDs = sortedRDs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [sortedRDs, totalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-teal-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">
          💰 Recurring Deposit Records
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
            className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:ring-2 focus:ring-teal-400 outline-none"
          />
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow"
          >
            📥 Download Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-teal-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Sl. No</th>
                <th
                  className="px-4 py-2 text-left cursor-pointer select-none"
                  onClick={() => handleSort("accountNumber")}
                >
                  Account No.{" "}
                  <ArrowUpDown
                    className="inline ml-1 text-gray-500"
                    size={14}
                  />
                </th>
                <th
                  className="px-4 py-2 text-left cursor-pointer select-none"
                  onClick={() => handleSort("memberName")}
                >
                  Member{" "}
                  <ArrowUpDown
                    className="inline ml-1 text-gray-500"
                    size={14}
                  />
                </th>
                <th className="px-4 py-2 text-left">Deposit (₹)</th>
                <th className="px-4 py-2 text-left">Total Deposited (₹)</th>
                <th className="px-4 py-2 text-left">Total Withdrawn (₹)</th>
                <th className="px-4 py-2 text-left">Available Balance (₹)</th>
                <th className="px-4 py-2 text-left">Interest (%)</th>
                <th className="px-4 py-2 text-left">Tenure (Months)</th>
                <th className="px-4 py-2 text-left">Act Opening Date</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Maturity Date</th>
                <th className="px-4 py-2 text-left">Maturity Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
                <th className="px-4 py-2 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {!loading && filteredRDs.length === 0 && (
                <tr>
                  <td
                    colSpan="15"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No RDs found.
                  </td>
                </tr>
              )}

              {paginatedRDs.map((rd, index) => {
                const totalWithdrawn =
                  rd.withdrawals?.reduce(
                    (sum, w) => sum + (w.amount || 0),
                    0
                  ) || 0;
                rd.availableBalance = Math.max(
                  (rd.totalDeposited || 0) - totalWithdrawn,
                  0
                );

                return (
                  <tr
                    key={rd._id}
                    className={`hover:bg-gray-50 ${
                      editingId === rd._id ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-medium">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="px-4 py-2 font-medium">
                      {editingId === rd._id ? (
                        <input
                          type="text"
                          value={editForm.accountNumber}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              accountNumber: e.target.value,
                            })
                          }
                          className="border rounded-md px-2 py-1 w-28 text-center"
                        />
                      ) : (
                        rd.accountNumber || "-"
                      )}
                    </td>

                    <td className="px-4 py-2 flex items-center gap-3">
                      <img
                        src={rd.memberId?.photo || "/default-avatar.png"}
                        alt={rd.memberId?.name || "Member"}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <p className="font-medium">
                          {rd.memberId?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rd.memberId?.phone || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {editingId === rd._id ? (
                        <input
                          type="number"
                          value={editForm.depositAmount}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              depositAmount: e.target.value,
                            })
                          }
                          className="border rounded-md px-2 py-1 w-24 text-center"
                        />
                      ) : (
                        <>
                          ₹
                          {Math.round(rd.depositAmount || 0).toLocaleString(
                            "en-IN"
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      ₹
                      {Math.round(rd.totalDeposited || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      ₹{Math.round(totalWithdrawn).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-700">
                      ₹{Math.round(rd.availableBalance).toLocaleString("en-IN")}
                    </td>

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
                    <td className="px-4 py-2 text-gray-600">
                      {editingId === rd._id ? (
                        <input
                          type="date"
                          value={editForm.initialDepositDate}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              initialDepositDate: e.target.value,
                            })
                          }
                          className="border rounded-md px-2 py-1"
                        />
                      ) : (
                        new Date(rd.initialDepositDate).toLocaleDateString(
                          "en-GB"
                        )
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {editingId === rd._id ? (
                        <input
                          type="date"
                          value={editForm.startDate}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              startDate: e.target.value,
                            })
                          }
                          className="border rounded-md px-2 py-1"
                        />
                      ) : (
                        new Date(rd.startDate).toLocaleDateString("en-GB")
                      )}
                    </td>

                    <td className="px-4 py-2 text-gray-600">
                      {new Date(rd.maturityDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      ₹
                      {Math.round(rd.maturityAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>

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
                              : rd.status === "Closed" ||
                                rd.status === "Matured"
                              ? "bg-gray-200 text-gray-600"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {rd.status}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-center space-x-2">
                      {editingId === rd._id ? (
                        <>
                          <button
                            onClick={() => handleSave(rd._id)}
                            className="text-green-600 cursor-pointer hover:text-green-800"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(rd)}
                            className="text-blue-600 cursor-pointer hover:text-blue-800"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rd._id)}
                            className="text-red-600 cursor-pointer hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                          {rd.status === "Active" && (
                            <button
                              onClick={() => handleClose(rd._id)}
                              className="text-gray-600 cursor-pointer hover:text-gray-800"
                            >
                              <Lock size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </td>

                    <td className="text-center">
                      <button
                        onClick={() => setSelectedRDId(rd._id)}
                        className="text-teal-800 cursor-pointer hover:text-green-500"
                      >
                        Schedule
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 cursor-pointer bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 cursor-pointer rounded ${
                  currentPage === i + 1
                    ? "bg-teal-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 cursor-pointer bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {selectedRDId && (
            <RDScheduleModal
              rdId={selectedRDId}
              onClose={() => {
                setSelectedRDId(null);
                fetchRDs();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
