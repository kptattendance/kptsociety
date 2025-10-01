"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

const LoanRepaymentSchedule = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch loan + repayment schedule
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

      // Ensure we always have an array
      setLoans(Array.isArray(res.data) ? res.data : [res.data]);
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        💰 My Loans & Repayment Schedule
      </h2>

      {loans.map((loan) => (
        <div key={loan._id} className="mb-12">
          {/* Loan Details */}
          <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mb-6">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Loan Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Interest %</th>
                <th className="py-3 px-4 text-right">Tenure</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Purpose</th>
                <th className="py-3 px-4 text-left">Collateral</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors">
                <td className="py-3 px-4">{loan.loanType}</td>
                <td className="py-3 px-4 text-right">
                  ₹{loan.loanAmount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">{loan.interestRate}</td>
                <td className="py-3 px-4 text-right">{loan.tenure}</td>
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
                <td className="py-3 px-4">{loan.loanPurpose}</td>
                <td className="py-3 px-4">
                  {loan.collateralType}: {loan.collateralDetails}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Repayment Schedule */}
          <h3 className="text-xl font-semibold mb-2">Repayment Schedule</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 shadow rounded-lg overflow-hidden">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Due Date</th>
                  <th className="py-2 px-4 text-right">EMI (Principal)</th>
                  <th className="py-2 px-4 text-right">EMI (Interest)</th>
                  <th className="py-2 px-4 text-right">Total EMI</th>
                  <th className="py-2 px-4 text-right">Outstanding</th>
                  <th className="py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.repayments.map((repay, index) => (
                  <tr
                    key={index}
                    className="border-b even:bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">
                      {new Date(repay.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="py-2 px-4 text-right">
                      ₹{repay.principal.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right">
                      ₹{repay.interest.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right">
                      ₹{repay.totalEMI.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right">
                      ₹{repay.scheduleOS.toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          repay.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
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
        </div>
      ))}
    </div>
  );
};

export default LoanRepaymentSchedule;
