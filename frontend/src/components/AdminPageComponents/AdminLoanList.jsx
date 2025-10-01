"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Edit } from "lucide-react";
import LoanRepaymentModal from "./LoanRepaymentModal"; // import modal component

export default function AdminLoanList() {
  const { getToken } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [editForm, setEditForm] = useState({
    loanAmount: "",
    interestRate: "",
    tenure: "",
    status: "",
  });
  const [selectedLoanId, setSelectedLoanId] = useState(null); // modal state

  const fetchLoans = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const loansWithMember = await Promise.all(
        res.data.map(async (loan) => {
          try {
            const memberRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/members/${
                loan.memberId?._id || loan.clerkId
              }?clerkId=${loan.clerkId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...loan, memberId: memberRes.data };
          } catch (err) {
            console.error("Error fetching member info:", err);
            return loan;
          }
        })
      );

      setLoans(loansWithMember);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this loan?")) return;
    try {
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/loans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoans(loans.filter((loan) => loan._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

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

  const submitEdit = async (loanId) => {
    try {
      const token = await getToken();
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${loanId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLoans(loans.map((loan) => (loan._id === loanId ? res.data : loan)));
      fetchLoans();
      setEditingLoanId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading loans...</p>;
  if (!loans.length)
    return <p className="p-6 text-center text-gray-500">No loans found.</p>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        💰 Loan Applications
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Member</th>
              <th className="py-3 px-4 text-left">Loan Type</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Interest %</th>
              <th className="py-3 px-4 text-right">Tenure</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
              <th className="py-3 px-4 text-center">Repayment Schedule</th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr
                key={loan._id}
                className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <td className="py-3 px-4">
                  {loan.memberId?.name || "Unknown"}
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
                        className="p-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingLoanId(null)}
                        className="p-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
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
                        Delete
                      </button>
                    </td>
                  </>
                )}

                {/* Repayment Schedule Button */}
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

      {/* Repayment Schedule Modal */}
      {selectedLoanId && (
        <LoanRepaymentModal
          loanId={selectedLoanId}
          onClose={() => setSelectedLoanId(null)}
        />
      )}
    </div>
  );
}
