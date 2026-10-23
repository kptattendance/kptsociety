"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import PageHeader from "../../../components/PageHeader";
import ExcelButton from "../../../components/ExcelButton";
import { downloadExcel, rdSheets } from "../../../utils/excelExport";

const ITEMS_PER_PAGE = 10;

const MemberRD = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [rds, setRDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState({});

  const fetchRDs = async () => {
    try {
      if (!user) return;

      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/member/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const rdArray = Array.isArray(res.data) ? res.data : [res.data];
      // ✅ Compute available balance for each RD (same logic as AdminRDTable)
      const updatedRDs = rdArray.map((rd) => {
        const totalWithdrawn =
          rd.withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
        const availableBalance = Math.max(
          (rd.totalDeposited || 0) - totalWithdrawn,
          0
        );
        return { ...rd, availableBalance };
      });

      setRDs(updatedRDs);

      const pages = {};
      updatedRDs.forEach((rd) => (pages[rd._id] = 1));
      setCurrentPage(pages);
    } catch (err) {
      console.error("Error fetching RDs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRDs();
  }, [user?.id]);

  if (loading)
    return (
      <p className="p-4 sm:p-6 text-center text-gray-500">Loading RD accounts...</p>
    );

  if (!rds.length)
    return (
      <p className="p-4 sm:p-6 text-center text-gray-500">No RD accounts found.</p>
    );

  const paginate = (rdId, direction) => {
    setCurrentPage((prev) => ({
      ...prev,
      [rdId]: prev[rdId] + direction,
    }));
  };

  return (
    <div className="p-2 sm:p-4 max-w-7xl mx-auto">
      <PageHeader
        eyebrow="My account"
        title="My Recurring Deposits"
        subtitle="Installments and withdrawals"
        actions={
          <ExcelButton onClick={() => downloadExcel("My_RD_Accounts", rdSheets(rds))} disabled={!rds.length} />
        }
      />

      {rds.map((rd) => {
        const page = currentPage[rd._id] || 1;
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const paginatedInstallments = rd.installments.slice(
          startIndex,
          startIndex + ITEMS_PER_PAGE
        );
        const totalPages = Math.ceil(rd.installments.length / ITEMS_PER_PAGE);

        return (
          <div key={rd._id} className="mb-8 sm:mb-12">
            {/* RD Summary */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden mb-4 text-sm sm:text-base">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="py-2 px-3 text-left">Member</th>
                    <th className="py-2 px-3 text-left">Account No</th>
                    <th className="py-2 px-3 text-right">Monthly Deposit</th>
                    <th className="py-2 px-3 text-right">Available Balance</th>
                    <th className="py-2 px-3 text-right">Tenure (months)</th>
                    <th className="py-2 px-3 text-right">Interest %</th>
                    <th className="py-2 px-3 text-right">Maturity Amt</th>
                    <th className="py-2 px-3 text-right">Maturity Date</th>
                    <th className="py-2 px-3 text-right">Pending Months</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rd.memberId.photo}
                          alt="Member"
                          className="w-10 h-10 rounded-full object-cover border-2 border-green-400"
                        />
                        <div>
                          <p className="font-semibold text-green-700">
                            {rd.memberId.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {rd.memberId.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3">{rd.accountNumber}</td>
                    <td className="py-2 px-3 text-right">
                      ₹
                      {Math.round(rd.depositAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-700">
                      ₹{Math.round(rd.availableBalance).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-3 text-right">{rd.tenureMonths}</td>
                    <td className="py-2 px-3 text-right">{rd.interestRate}</td>
                    <td className="py-2 px-3 text-right">
                      ₹
                      {Math.round(rd.maturityAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {new Date(rd.maturityDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {rd.installments?.filter((i) => i.status === "Pending")
                        .length || 0}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          rd.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {rd.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Installment Schedule */}
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-indigo-700">
              Installment Schedule
            </h3>
            <div className="bg-gradient-to-r from-pink-200 to-teal-100 p-4 sm:p-6">
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
                        "linear-gradient(90deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 100%)",
                    }}
                  >
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Payment Mode</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInstallments.map((inst, index) => (
                      <tr
                        key={index}
                        className="transition-colors hover:bg-white/20 border-b"
                      >
                        <td className="py-1 px-2">{startIndex + index + 1}</td>
                        <td className="py-1 px-2">
                          {new Date(inst.dueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </td>
                        <td className="py-1 px-2 text-right">
                          ₹
                          {Math.round(inst.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-1 px-2 text-right">
                          {inst.paymentMode || "-"}
                        </td>
                        <td className="py-1 px-2 text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              inst.status === "Paid"
                                ? "bg-green-200 text-green-700"
                                : inst.status === "Pending"
                                ? "bg-yellow-200 text-yellow-700"
                                : "bg-red-200 text-red-700"
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-2 text-sm sm:text-base">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => paginate(rd._id, -1)}
                >
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => paginate(rd._id, 1)}
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

export default MemberRD;
