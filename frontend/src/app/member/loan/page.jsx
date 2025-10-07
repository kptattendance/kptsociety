"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

const ITEMS_PER_PAGE = 10;

const MemberLoan = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState({});

  const fetchLoanSchedule = async () => {
    try {
      if (!user) return;
      const token = await getToken();

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const loansArray = Array.isArray(res.data) ? res.data : [res.data];
      setLoans(loansArray);

      const pages = {};
      loansArray.forEach((loan) => (pages[loan._id] = 1));
      setCurrentPage(pages);
    } catch (err) {
      console.error("Error fetching loan repayment schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanSchedule();
  }, [user]);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500">Loading loan schedule...</p>
    );

  if (!loans.length)
    return <p className="p-6 text-center text-gray-500">No loans found.</p>;

  const paginate = (loanId, direction) => {
    setCurrentPage((prev) => ({
      ...prev,
      [loanId]: prev[loanId] + direction,
    }));
  };

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center">
        💰 My Loans & Repayment Schedule
      </h2>

      {loans.map((loan) => {
        const pendingInstallments = loan.repayments.filter(
          (r) => r.status === "Pending"
        ).length;
        const pendingPrincipal = loan.repayments
          .filter((r) => r.status === "Pending")
          .reduce((acc, r) => acc + r.principal, 0);

        const page = currentPage[loan._id] || 1;
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const paginatedRepayments = loan.repayments.slice(
          startIndex,
          startIndex + ITEMS_PER_PAGE
        );
        const totalPages = Math.ceil(loan.repayments.length / ITEMS_PER_PAGE);

        const member = loan.memberId || {};

        return (
          <div key={loan._id} className="mb-8 sm:mb-12">
            {/* Loan Details */}
            {/* Loan Details */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mb-4 text-sm sm:text-base">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">
                      Member
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">
                      Loan Type
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      Amount
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      Interest %
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      Tenure
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">
                      Status
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">
                      Purpose
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-left hidden sm:table-cell">
                      Collateral
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-left">
                      Pending Installments
                    </th>
                    <th className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      Pending Principal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors">
                    {/* ✅ Member Column */}
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photo}
                          alt="Member"
                          className="w-10 h-10 rounded-full object-cover border-2 border-green-400"
                        />
                        <div>
                          <p className="font-semibold text-green-700">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {member.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Existing Columns */}
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      {loan.loanType}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      ₹{loan.loanAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      {loan.interestRate}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      {loan.tenure}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
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
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      {loan.loanPurpose}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 hidden sm:table-cell">
                      {loan.collateralType}: {loan.collateralDetails}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4">
                      {pendingInstallments}
                    </td>
                    <td className="py-2 px-2 sm:py-3 sm:px-4 text-right">
                      ₹{pendingPrincipal.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Lumpsum Payment History */}
            {loan.lumpSumPayments && loan.lumpSumPayments.length > 0 && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold mt-4 mb-2 text-indigo-700">
                  Lumpsum Payment History
                </h3>
                <div className="overflow-x-auto mb-2">
                  <table
                    className="min-w-full text-sm sm:text-base rounded-lg overflow-hidden shadow-lg"
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <thead
                      className="text-white"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 100%)",
                      }}
                    >
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Payment Date</th>
                        <th className="py-2 px-3 text-right">Amount Paid</th>
                        <th className="py-2 px-3 text-right">Mode</th>
                        <th className="py-2 px-3 text-right">
                          Installment Number
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan.lumpSumPayments.map((lump, index) => (
                        <tr
                          key={index}
                          className="transition-colors hover:bg-white/20"
                        >
                          <td className="py-1 px-2">{index + 1}</td>
                          <td className="py-1 px-2">
                            {new Date(lump.paidAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="py-1 px-2 text-right">
                            ₹{lump.amount.toLocaleString()}
                          </td>
                          <td className="py-1 px-2 text-right">{lump.mode}</td>
                          <td className="py-1 px-2 text-right">
                            {lump.installment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Repayment Schedule */}
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-indigo-700">
              Repayment Schedule
            </h3>
            <div className="overflow-x-auto mb-2">
              <table
                className="min-w-full text-sm sm:text-base rounded-lg overflow-hidden shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <thead
                  className="text-white"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(16,185,129,0.8) 0%, rgba(34,197,94,0.8) 100%)",
                  }}
                >
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Due Date</th>
                    <th className="py-2 px-3 text-right">EMI (Principal)</th>
                    <th className="py-2 px-3 text-right">EMI (Interest)</th>
                    <th className="py-2 px-3 text-right">Total EMI</th>
                    <th className="py-2 px-3 text-right">Outstanding</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRepayments.map((repay, index) => (
                    <tr
                      key={index}
                      className="transition-colors hover:bg-white/20 border-b"
                    >
                      <td className="py-1 px-2">{startIndex + index + 1}</td>
                      <td className="py-1 px-2">
                        {new Date(repay.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="py-1 px-2 text-right">
                        ₹{repay.principal.toFixed(2).toLocaleString()}
                      </td>
                      <td className="py-1 px-2 text-right">
                        ₹{repay.interest.toFixed(2).toLocaleString()}
                      </td>
                      <td className="py-1 px-2 text-right">
                        ₹{repay.totalEMI.toFixed(2).toLocaleString()}
                      </td>
                      <td className="py-1 px-2 text-right font-semibold text-blue-700">
                        ₹{repay.scheduleOS.toFixed(2).toLocaleString()}
                      </td>
                      <td className="py-1 px-2">
                        <span
                          className={`px-2 py-1 rounded-2xl text-xs sm:text-sm font-medium ${
                            repay.status === "Paid"
                              ? "bg-green-200 text-green-700"
                              : "bg-orange-200 text-orange-700"
                          }`}
                        >
                          {repay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 sm:space-x-4 mt-2 text-sm sm:text-base">
                <button
                  className="px-2 sm:px-3 py-1 bg-indigo-500 text-white rounded disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => paginate(loan._id, -1)}
                >
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-2 sm:px-3 py-1 bg-indigo-500 text-white rounded disabled:opacity-50"
                  disabled={page === totalPages}
                  onClick={() => paginate(loan._id, 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberLoan;
