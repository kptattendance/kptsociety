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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const loansArray = Array.isArray(res.data) ? res.data : [res.data];
      setLoans(loansArray);
console.log(loansArray)
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
      <p className="p-6 text-center text-gray-500 text-sm sm:text-base">
        Loading loan schedule...
      </p>
    );

  if (!loans.length)
    return (
      <p className="p-6 text-center text-gray-500 text-sm sm:text-base">
        No loans found.
      </p>
    );

  const paginate = (loanId, direction) => {
    setCurrentPage((prev) => ({
      ...prev,
      [loanId]: prev[loanId] + direction,
    }));
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
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
          <div
            key={loan._id}
            className="mb-8 sm:mb-12 bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-md"
          >
            {/* Loan Details */}
            <div className="overflow-x-auto">
              <table className="min-w-full border text-xs sm:text-sm md:text-base rounded-lg overflow-hidden shadow">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left">Member</th>
                    <th className="px-3 py-2 text-left">Loan Type</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Interest %</th>
                    <th className="px-3 py-2 text-right">Tenure</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left hidden md:table-cell">
                      Purpose
                    </th>
                    <th className="px-3 py-2 text-left hidden lg:table-cell">
                      Collateral
                    </th>
                    <th className="px-3 py-2 text-center">Pending Inst.</th>
                    <th className="px-3 py-2 text-right">Pending ₹</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-white even:bg-gray-50 hover:bg-gray-100 transition">
                    {/* ✅ Member */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.photo || "/default-avatar.png"}
                          alt="Member"
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-400 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-green-700">
                            {member.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {member.phone || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2">{loan.loanType}</td>
                    <td className="px-3 py-2 text-right">
                      ₹
                      {Math.round(loan.loanAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {loan.interestRate}
                    </td>
                    <td className="px-3 py-2 text-right">{loan.tenure}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <td className="px-3 py-2 hidden md:table-cell">
                      {loan.loanPurpose}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      {loan.collateralType
                        ? `${loan.collateralType}: ${loan.collateralDetails}`
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {pendingInstallments}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₹
                      {Math.round(pendingPrincipal || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Lumpsum Payments */}
            {loan.lumpSumPayments?.length > 0 && (
              <>
                <h3 className="text-base sm:text-lg font-semibold mt-4 mb-2 text-indigo-700">
                  Lumpsum Payment History
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs sm:text-sm md:text-base border rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                      <tr>
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">Date</th>
                        <th className="px-2 py-2 text-right">Amount</th>
                        <th className="px-2 py-2 text-right">Mode</th>
                        <th className="px-2 py-2 text-right">Installment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan.lumpSumPayments.map((lump, i) => (
                        <tr
                          key={i}
                          className="even:bg-gray-50 hover:bg-gray-100"
                        >
                          <td className="px-2 py-1">{i + 1}</td>
                          <td className="px-2 py-1">
                            {new Date(lump.paidAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="px-2 py-1 text-right">
                            ₹
                            {Math.round(lump.amount || 0).toLocaleString(
                              "en-IN"
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">{lump.mode}</td>
                          <td className="px-2 py-1 text-right">
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
            <h3 className="text-base sm:text-lg font-semibold mt-4 mb-2 text-green-700">
              Repayment Schedule
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm md:text-base border rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  <tr>
                    <th className="px-2 py-2">#</th>
                    <th className="px-2 py-2">Due Date</th>
                    <th className="px-2 py-2 text-right">Principal</th>
                    <th className="px-2 py-2 text-right">Interest</th>
                    <th className="px-2 py-2 text-right">Total</th>
                    <th className="px-2 py-2 text-right">Outstanding</th>
                    <th className="px-2 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRepayments.length ? (
                    paginatedRepayments.map((repay, index) => (
                      <tr
                        key={index}
                        className="even:bg-gray-50 hover:bg-gray-100"
                      >
                        <td className="px-2 py-1">{startIndex + index + 1}</td>
                        <td className="px-2 py-1">
                          {new Date(repay.dueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </td>
                        <td className="px-2 py-1 text-right">
                          ₹
                          {Math.round(repay.principal || 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                        <td className="px-2 py-1 text-right">
                          ₹
                          {Math.round(repay.interest || 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                        <td className="px-2 py-1 text-right">
                          ₹
                          {Math.round(repay.totalEMI || 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                        <td className="px-2 py-1 text-right text-blue-700 font-medium">
                          ₹
                          {Math.round(repay.scheduleOS || 0).toLocaleString(
                            "en-IN"
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              repay.status === "Paid"
                                ? "bg-green-200 text-green-700"
                                : "bg-orange-200 text-orange-700"
                            }`}
                          >
                            {repay.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-3 text-gray-500 italic"
                      >
                        No repayment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-3 text-sm sm:text-base">
                <button
                  className="px-3 py-1 bg-indigo-500 text-white rounded-full disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => paginate(loan._id, -1)}
                >
                  Prev
                </button>
                <span>
                  Page {page} / {totalPages}
                </span>
                <button
                  className="px-3 py-1 bg-indigo-500 text-white rounded-full disabled:opacity-50"
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
