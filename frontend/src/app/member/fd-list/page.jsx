"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { Calendar, IndianRupee, Clock, Info } from "lucide-react";

const MemberFD = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [fds, setFDs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFDs = async () => {
    try {
      if (!user) return;
      const token = await getToken();

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/fd/member/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFDs(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error("Error fetching FDs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFDs();
  }, [user]);

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500 animate-pulse">
        Loading FD accounts...
      </p>
    );

  if (!fds.length)
    return (
      <p className="p-6 text-center text-gray-500">No FD accounts found.</p>
    );

  const getRemainingMonths = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    const totalMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    const elapsedMonths =
      (now.getFullYear() - startDate.getFullYear()) * 12 +
      (now.getMonth() - startDate.getMonth());
    return Math.max(totalMonths - elapsedMonths, 0);
  };

  const member = fds[0]?.memberId;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {member && (
        <div className="flex items-center gap-5 bg-white rounded-xl shadow p-5 border">
          <img
            src={member.photo}
            alt="Member"
            className="w-20 h-20 rounded-full border object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {member.name}
            </h3>
            <p className="text-gray-600">📞 {member.phone || "N/A"}</p>
            <p className="text-gray-600">📧 {member.email}</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-center text-gray-800">
        💰 My Fixed Deposit Accounts
      </h2>

      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">FD No</th>
              <th className="p-3">Status</th>
              <th className="p-3">Principal</th>
              <th className="p-3">Maturity</th>
              <th className="p-3">Interest</th>
              <th className="p-3">Tenure</th>
              <th className="p-3">Start</th>
              <th className="p-3">Maturity Date</th>
              <th className="p-3">Remaining</th>
              <th className="p-3">Compounding</th>
              <th className="p-3">Payout</th>
              <th className="p-3">Auto Renew</th>
              <th className="p-3">Preclosure</th>
              <th className="p-3">Penalty</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>

          <tbody>
            {fds.map((fd) => {
              const remainingMonths = getRemainingMonths(
                fd.startDate,
                fd.maturityDate
              );

              return (
                <tr
                  key={fd._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-semibold">{fd.accountNumber}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        fd.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {fd.status}
                    </span>
                  </td>

                  <td className="p-3 font-medium">
                    ₹{Math.round(fd.principal || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="p-3 font-medium text-green-700">
                    ₹
                    {Math.round(fd.maturityAmount || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="p-3">{fd.interestRate}%</td>
                  <td className="p-3">{fd.tenureMonths}m</td>

                  <td className="p-3">
                    {new Date(fd.startDate).toLocaleDateString("en-IN")}
                  </td>

                  <td className="p-3">
                    {new Date(fd.maturityDate).toLocaleDateString("en-IN")}
                  </td>

                  <td
                    className={`p-3 font-semibold ${
                      remainingMonths <= 3
                        ? "text-red-600"
                        : remainingMonths <= 12
                        ? "text-yellow-600"
                        : "text-green-700"
                    }`}
                  >
                    {remainingMonths} m
                  </td>

                  <td className="p-3">{fd.compoundingFrequency}</td>
                  <td className="p-3">{fd.payoutFrequency}</td>
                  <td className="p-3">{fd.autoRenew ? "Yes" : "No"}</td>
                  <td className="p-3">
                    {fd.preclosureAllowed ? "Allowed" : "Not Allowed"}
                  </td>
                  <td className="p-3">
                    {fd.preclosureAllowed
                      ? `${fd.preclosurePenaltyPercent}%`
                      : "-"}
                  </td>
                  <td className="p-3 max-w-[170px] truncate">
                    {fd.notes || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberFD;
