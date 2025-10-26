"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Edit, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import LoanRepaymentModal from "../../../components/AdminPageComponents/LoanRepaymentModal";
import { toast } from "react-toastify";
import LoadOverlay from "../../../components/LoadOverlay";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminLoanList() {
  const { getToken } = useAuth();
  const [loadingMessage, setLoadingMessage] = useState("Processing loans...");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 6;

  // ✅ Fetch loans
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const loansWithMember = await Promise.all(
        res.data.map(async (loan) => {
          let memberData = loan.memberId;
          if (loan.memberId?._id) {
            try {
              const memberRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/members/${loan.memberId._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              memberData = memberRes.data;
            } catch (err) {
              console.error("Error fetching member info:", err);
            }
          }

          let pendingAmount = 0;
          let pendingInstallments = 0;
          if (loan.repayments?.length) {
            pendingInstallments = loan.repayments.filter(
              (r) => r.status !== "Paid"
            ).length;

            pendingAmount = loan.repayments
              .filter((r) => r.status !== "Paid")
              .reduce((sum, r) => sum + r.principal, 0);
          }

          return {
            ...loan,
            memberId: memberData,
            pendingAmount,
            pendingInstallments,
          };
        })
      );
      setLoans(loansWithMember);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // ✅ Confirm dialog
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

  // ✅ Delete loan
  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      "Delete Loan?",
      "This cannot be undone!"
    );
    if (!confirmed) return;
    try {
      setLoading(true);
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoans(loans.filter((loan) => loan._id !== id));
      toast.success("🗑️ Loan deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete loan");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Editing
  const startEditing = (loan) => {
    setEditingLoanId(loan._id);
    setEditForm({
      loanType: loan.loanType || "",
      accountNumber: loan.accountNumber || "",
      chequeNumber: loan.chequeDetails?.chequeNumber || "",
      startDate: loan.startDate
        ? new Date(loan.startDate).toISOString().split("T")[0]
        : "",
      loanAmount: loan.loanAmount || "",
      interestRate: loan.interestRate || "",
      tenure: loan.tenure || "",
      status: loan.status || "Pending",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // ✅ Submit edit
  const submitEdit = async (loanId) => {
    try {
      const token = await getToken();
      setLoading(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${loanId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Loan updated successfully");
      setEditingLoanId(null);
      fetchLoans();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update loan");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedLoans = [...loans].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = "";
    let bVal = "";
    if (sortConfig.key === "member") {
      aVal = a.memberId?.name || "";
      bVal = b.memberId?.name || "";
    } else if (sortConfig.key === "accountNumber") {
      aVal = a.accountNumber || "";
      bVal = b.accountNumber || "";
    }
    return sortConfig.direction === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  // ✅ Filter + pagination
  const filteredLoans = sortedLoans.filter((loan) => {
    const name = loan.memberId?.name?.toLowerCase() || "";
    const phone = loan.memberId?.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const currentLoans = filteredLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ Excel export
  const handleDownloadExcel = () => {
    const dataToExport = filteredLoans.length > 0 ? filteredLoans : loans;
    if (!dataToExport.length) {
      toast.info("No loan data available to export!");
      return;
    }

    const exportData = dataToExport.map((loan, index) => ({
      "Sl. No.": index + 1,
      "Account No": loan.accountNumber || "-",
      "Member Name": loan.memberId?.name || "Unknown",
      Phone: loan.memberId?.phone || "N/A",
      "Loan Type": loan.loanType || "-",
      "Cheque No": loan.chequeDetails?.chequeNumber || "-",
      "Start Date": loan.startDate
        ? new Date(loan.startDate).toLocaleDateString("en-IN")
        : "-",
      "Amount (₹)": loan.loanAmount?.toLocaleString("en-IN") || "0",
      "Interest (%)": loan.interestRate || "-",
      Tenure: loan.tenure || "-",
      "Pending Amount (₹)": loan.pendingAmount?.toLocaleString("en-IN") || "0",
      "Pending Inst.": loan.pendingInstallments || 0,
      Status: loan.status || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Records");
    worksheet["!cols"] = Object.keys(exportData[0]).map(() => ({ wch: 22 }));

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Loan_Records_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <LoadOverlay show={true} message={loadingMessage} />;

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 to-orange-100 p-6">
      <div className="p-4 max-w-8xl mx-auto">
        <LoadOverlay show={loading} message={loadingMessage} />
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          💰 Loan Applications
        </h2>

        {/* 🔍 Search + Download */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow cursor-pointer"
          >
            📥 Download Excel
          </button>
        </div>

        {/* ✅ Table */}
        <div className="relative overflow-x-auto  rounded-lg border border-gray-200 shadow-lg">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-left">Sl. No.</th>
                {/* Account No. */}
                <th
                  className="py-2 px-3 text-left cursor-pointer select-none"
                  onClick={() => handleSort("accountNumber")}
                >
                  <div className="flex items-center gap-1">
                    Account No.
                    <div className="flex flex-col leading-none">
                      <ChevronUp
                        className={`w-3 h-3 ${
                          sortConfig.key === "accountNumber" &&
                          sortConfig.direction === "asc"
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      />
                      <ChevronDown
                        className={`w-3 h-3 -mt-1 ${
                          sortConfig.key === "accountNumber" &&
                          sortConfig.direction === "desc"
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                </th>

                {/* Member */}
                <th
                  className="py-2 px-3 text-left cursor-pointer select-none"
                  onClick={() => handleSort("member")}
                >
                  <div className="flex items-center gap-1">
                    Member
                    <div className="flex flex-col leading-none">
                      <ChevronUp
                        className={`w-3 h-3 ${
                          sortConfig.key === "member" &&
                          sortConfig.direction === "asc"
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      />
                      <ChevronDown
                        className={`w-3 h-3 -mt-1 ${
                          sortConfig.key === "member" &&
                          sortConfig.direction === "desc"
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                </th>

                <th className="py-2 px-3 text-left">Loan Type</th>
                <th className="py-2 px-3 text-left">Cheque No.</th>
                <th className="py-2 px-3 text-left">Start Date</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th className="py-2 px-3 text-right">Interest %</th>
                <th className="py-2 px-3 text-right">Tenure</th>
                <th className="py-2 px-3 text-center">Actions</th>
                <th className="py-2 px-3 text-right">Pending Amt</th>
                <th className="py-2 px-3 text-right">Pending Inst.</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-center">Repayment Schedule</th>
              </tr>
            </thead>

            <tbody>
              {currentLoans.map((loan, index) => {
                const isEditing = editingLoanId === loan._id;
                return (
                  <tr
                    key={loan._id}
                    className="border-b even:bg-gray-50 hover:bg-indigo-50 transition"
                  >
                    <td className="px-4 py-2 text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Account No */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="accountNumber"
                          value={editForm.accountNumber}
                          onChange={handleEditChange}
                          className="border rounded-md px-2 py-1 w-full"
                        />
                      ) : (
                        loan.accountNumber || "-"
                      )}
                    </td>

                    {/* Member */}
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <img
                        src={loan.memberId?.photo || "/default-avatar.png"}
                        alt="member"
                        className="w-8 h-8 rounded-full border"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {loan.memberId?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          📞 {loan.memberId?.phone || "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Editable cells */}
                    {[
                      "loanType",
                      "chequeNumber",
                      "startDate",
                      "loanAmount",
                      "interestRate",
                      "tenure",
                      "status",
                    ].map((field, idx) => (
                      <td
                        key={idx}
                        className={`py-3 px-4 ${
                          ["loanAmount", "interestRate", "tenure"].includes(
                            field
                          )
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {isEditing ? (
                          field === "status" ? (
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditChange}
                              className="border rounded-md px-2 py-1 w-full"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          ) : field === "startDate" ? (
                            <input
                              type="date"
                              name="startDate"
                              value={editForm.startDate}
                              onChange={handleEditChange}
                              className="border rounded-md px-2 py-1 w-full"
                            />
                          ) : (
                            <input
                              type={
                                [
                                  "loanAmount",
                                  "interestRate",
                                  "tenure",
                                ].includes(field)
                                  ? "number"
                                  : "text"
                              }
                              name={field}
                              value={editForm[field]}
                              onChange={handleEditChange}
                              className="border rounded-md px-2 py-1 w-full"
                            />
                          )
                        ) : field === "status" ? (
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                              loan.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : loan.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {loan.status}
                          </span>
                        ) : field === "startDate" ? (
                          loan.startDate ? (
                            new Date(loan.startDate).toLocaleDateString("en-IN")
                          ) : (
                            "-"
                          )
                        ) : field === "chequeNumber" ? (
                          loan.chequeDetails?.chequeNumber || "-"
                        ) : field === "loanAmount" ? (
                          `₹${loan.loanAmount?.toLocaleString() || "-"}`
                        ) : (
                          loan[field] || "-"
                        )}
                      </td>
                    ))}

                    {/* Pending */}
                    <td className="py-3 px-4 text-right">
                      ₹
                      {loan.pendingAmount?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {loan.pendingInstallments || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 flex justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => submitEdit(loan._id)}
                            className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingLoanId(null)}
                            className="p-2 bg-gray-200 cursor-pointer text-gray-700 rounded-md hover:bg-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(loan)}
                            className="p-2 rounded-full cursor-pointer bg-blue-100 text-blue-600 hover:bg-blue-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loan._id)}
                            className="p-2 rounded-full cursor-pointer bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>

                    {/* Repayment Modal */}
                    <td className="text-center">
                      <button
                        onClick={() =>
                          setSelectedLoanId(
                            selectedLoanId === loan._id ? null : loan._id
                          )
                        }
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm shadow cursor-pointer"
                      >
                        View
                      </button>
                      {selectedLoanId === loan._id && (
                        <LoanRepaymentModal
                          loanId={loan._id}
                          onClose={() => setSelectedLoanId(null)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        

        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 cursor-pointer bg-gray-200 rounded disabled:opacity-50"
          >
            ← Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 cursor-pointer rounded ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
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
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
