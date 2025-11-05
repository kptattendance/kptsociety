"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

const ITEMS_PER_PAGE = 6;

const MemberCD = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [cds, setCDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageState, setPageState] = useState({}); // per-CD pagination

  const fetchCDs = async () => {
    try {
      if (!user) return;
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/member/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const cdArray = Array.isArray(res.data) ? res.data : [res.data];
      setCDs(cdArray);
      const initialPages = {};
      cdArray.forEach((cd) => {
        initialPages[cd._id] = {
          installments: 1,
          withdrawals: 1,
          dividends: 1,
        };
      });
      setPageState(initialPages);
    } catch (err) {
      console.error("Error fetching CDs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCDs();
  }, [user]);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500">Loading CD accounts...</p>
    );

  if (!cds.length)
    return (
      <p className="p-6 text-center text-gray-500">No CD accounts found.</p>
    );

  const paginate = (cdId, type, direction) => {
    setPageState((prev) => ({
      ...prev,
      [cdId]: {
        ...prev[cdId],
        [type]: prev[cdId][type] + direction,
      },
    }));
  };

  const getPageData = (arr, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return arr.slice(start, start + ITEMS_PER_PAGE);
  };

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        💰 My Compulsory Deposit (CD) Accounts
      </h2>
      {cds.map((cd) => (
        <div
          key={cd._id}
          className="mb-12 border rounded-lg shadow-md bg-white"
        >
          {cd.memberId && (
            <div className="flex items-center gap-4 mb-8 bg-white shadow-md rounded-lg p-4">
              <img
                src={cd.memberId.photo || "/default-avatar.png"}
                alt={cd.memberId.name || "Member"}
                className="w-16 h-16 rounded-full border-2 border-green-400 object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-green-700">
                  {cd.memberId.name || "Unknown Member"}
                </h3>
                <p className="text-gray-600">
                  📞 {cd.memberId.phone || "Not Available"}
                </p>
                <p className="text-gray-600">
                  📧 {cd.memberId.email || "Not Available"}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      {cds.map((cd) => {
        const pages = pageState[cd._id];
        const installments = getPageData(cd.installments, pages.installments);
        const withdrawals = cd.transactions.filter(
          (t) => t.type === "Withdrawal"
        );
        const dividends = cd.transactions.filter((t) => t.type === "Dividend");

        const totalInstallmentPages = Math.ceil(
          cd.installments.length / ITEMS_PER_PAGE
        );
        const totalWithdrawalPages = Math.ceil(
          withdrawals.length / ITEMS_PER_PAGE
        );
        const totalDividendPages = Math.ceil(dividends.length / ITEMS_PER_PAGE);

        const paginatedWithdrawals = getPageData(
          withdrawals,
          pages.withdrawals
        );
        const paginatedDividends = getPageData(dividends, pages.dividends);

        const pendingCount =
          cd.installments?.filter((i) => i.status === "Pending").length || 0;

        return (
          <div
            key={cd._id}
            className="mb-12 border rounded-lg shadow-md bg-white"
          >
            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold">
                    Account No: {cd.accountNumber}
                  </p>
                  <p>
                    Status: <span className="font-bold">{cd.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    Balance: ₹
                    {Math.round(
                      cd.totalDeposited - cd.totalWithdrawn
                    ).toLocaleString("en-IN")}
                  </p>
                  <p>
                    Total Deposit: ₹
                    {Math.round(cd.totalDeposited || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Installments */}
              <section>
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  🗓️ Installment Schedule
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-green-100 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Month #</th>
                        <th className="px-3 py-2">Due Date</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Status</th>
                        <th className="px-3 py-2 text-right">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {installments.map((inst, idx) => (
                        <tr
                          key={idx}
                          className="border-b hover:bg-gray-50 text-center"
                        >
                          <td className="px-3 py-2">{inst.monthNo}</td>
                          <td className="px-3 py-2">
                            {new Date(inst.dueDate).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ₹
                            {Math.round(inst.amount || 0).toLocaleString(
                              "en-IN"
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
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
                          <td className="px-3 py-2 text-right">
                            {inst.paidAt
                              ? new Date(inst.paidAt).toLocaleDateString(
                                  "en-GB"
                                )
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalInstallmentPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-2 text-sm">
                    <button
                      onClick={() => paginate(cd._id, "installments", -1)}
                      disabled={pages.installments === 1}
                      className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span>
                      Page {pages.installments} of {totalInstallmentPages}
                    </span>
                    <button
                      onClick={() => paginate(cd._id, "installments", 1)}
                      disabled={pages.installments === totalInstallmentPages}
                      className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>

              {/* Withdrawals */}
              <section>
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  💰 Withdrawal History
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-red-100 text-gray-700">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedWithdrawals.map((t, idx) => (
                        <tr
                          key={idx}
                          className="border-b text-center hover:bg-gray-50"
                        >
                          <td className="px-3 py-2">
                            {(pages.withdrawals - 1) * ITEMS_PER_PAGE + idx + 1}
                          </td>
                          <td className="px-3 py-2">
                            {new Date(t.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-3 py-2">₹{t.amount.toFixed(2)}</td>
                          <td className="px-3 py-2">{t.reason || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalWithdrawalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-2 text-sm">
                    <button
                      onClick={() => paginate(cd._id, "withdrawals", -1)}
                      disabled={pages.withdrawals === 1}
                      className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span>
                      Page {pages.withdrawals} of {totalWithdrawalPages}
                    </span>
                    <button
                      onClick={() => paginate(cd._id, "withdrawals", 1)}
                      disabled={pages.withdrawals === totalWithdrawalPages}
                      className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>

              {/* Dividends */}
              <section>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">
                  💹 Dividend History
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-teal-100 text-gray-700">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDividends.map((t, idx) => (
                        <tr
                          key={idx}
                          className="border-b text-center hover:bg-gray-50"
                        >
                          <td className="px-3 py-2">
                            {(pages.dividends - 1) * ITEMS_PER_PAGE + idx + 1}
                          </td>
                          <td className="px-3 py-2">
                            {new Date(t.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-3 py-2">₹{t.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalDividendPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-2 text-sm">
                    <button
                      onClick={() => paginate(cd._id, "dividends", -1)}
                      disabled={pages.dividends === 1}
                      className="px-3 py-1 bg-teal-600 text-white rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span>
                      Page {pages.dividends} of {totalDividendPages}
                    </span>
                    <button
                      onClick={() => paginate(cd._id, "dividends", 1)}
                      disabled={pages.dividends === totalDividendPages}
                      className="px-3 py-1 bg-teal-600 text-white rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MemberCD;
