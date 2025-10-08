"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Edit, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import LoanRepaymentModal from "../../../components/AdminPageComponents/LoanRepaymentModal";
import { toast } from "react-toastify";
import LoadOverlay from "../../../components/LoadOverlay";

export default function AdminLoanList() {
  const { getToken } = useAuth();
  const [loadingMessage, setLoadingMessage] = useState("Processing loans...");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [editForm, setEditForm] = useState({
    loanAmount: "",
    interestRate: "",
    tenure: "",
    status: "",
  });
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // ✅ 15 records per page

  // ✅ Fetch Loans with member data and compute pending amounts/installments
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

          // Compute pending amount & installments if schedule exists
          let pendingAmount = 0;
          let pendingInstallments = 0;
          if (loan.repayments && loan.repayments.length) {
            pendingInstallments = loan.repayments.filter(
              (r) => r.status === "Pending"
            ).length;
            pendingAmount = loan.repayments
              .filter((r) => r.status === "Pending")
              .reduce((sum, r) => sum + r.totalEMI, 0);
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

  // ✅ Delete Loan
  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      "Delete Loan?",
      "This action cannot be undone!"
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

  // ✅ Start Editing
  const startEditing = (loan) => {
    setEditingLoanId(loan._id);
    setEditForm({
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

  // ✅ Submit Edit
  const submitEdit = async (loanId) => {
    try {
      const token = await getToken();
      setLoading(true);
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan._id === loanId ? { ...loan, ...editForm } : loan
        )
      );

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${loanId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("✅ Loan updated successfully");
      setEditingLoanId(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update loan");
      fetchLoans();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter loans by name or phone
  const filteredLoans = loans.filter((loan) => {
    const name = loan.memberId?.name?.toLowerCase() || "";
    const phone = loan.memberId?.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <LoadOverlay show={true} message={loadingMessage} />;

  if (!loans.length)
    return (
      <p className="p-6 text-center text-gray-500 italic">No loans found.</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-orange-100 p-6">
      <div className="p-4 max-w-8xl mx-auto ">
        <LoadOverlay show={loading} message={loadingMessage} />

        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          💰 Loan Applications
        </h2>

        {/* 🔍 Search Bar */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:ring-2 focus:ring-orange-400 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Sl. No.</th>
                <th className="py-3 px-4 text-left">Member</th>
                <th className="py-3 px-4 text-left">Loan Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Interest %</th>
                <th className="py-3 px-4 text-right">Tenure</th>
                <th className="py-3 px-4 text-right">Pending Amount</th>
                <th className="py-3 px-4 text-right">Pending Installments</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
                <th className="py-3 px-4 text-center">Repayment Schedule</th>
              </tr>
            </thead>

            <tbody>
              {currentLoans.map((loan, index) => (
                <tr
                  key={loan._id}
                  className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <td className="px-4 py-2 text-gray-600">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

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

                  <td className="py-3 px-4">{loan.loanType}</td>

                  {editingLoanId === loan._id ? (
                    <>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          name="loanAmount"
                          value={editForm.loanAmount}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded-md text-right"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          name="interestRate"
                          value={editForm.interestRate}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded-md text-right"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          name="tenure"
                          value={editForm.tenure}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded-md text-right"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          name="status"
                          value={editForm.status}
                          onChange={handleEditChange}
                          className="w-full p-1 border rounded-md"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 flex justify-center gap-2">
                        <button
                          onClick={() => submitEdit(loan._id)}
                          className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingLoanId(null)}
                          className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-right">
                        ₹{loan.loanAmount?.toLocaleString() || "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {loan.interestRate || "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {loan.tenure || "-"}
                      </td>
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
                      <td className="py-3 px-4">
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
                      </td>

                      <td className="py-3 px-4 flex justify-center gap-2">
                        <button
                          onClick={() => startEditing(loan)}
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loan._id)}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedLoanId(loan._id)}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    >
                      View Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination Controls */}
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            Next
          </button>
        </div>

        {selectedLoanId && (
          <LoanRepaymentModal
            loanId={selectedLoanId}
            onClose={() => setSelectedLoanId(null)}
          />
        )}
      </div>
    </div>
  );
}
