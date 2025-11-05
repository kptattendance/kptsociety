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
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* ✅ Member Info */}
      {member && (
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition">
          <img
            src={member.photo}
            alt="Member"
            className="w-24 h-24 rounded-full border-4 border-green-300 object-cover shadow-sm"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-semibold text-green-700 tracking-wide">
              {member.name}
            </h3>
            <div className="mt-1 space-y-1 text-gray-600 text-sm sm:text-base">
              <p>📞 {member.phone || "Not Available"}</p>
              <p>📧 {member.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FD Section Header */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mt-6">
        💰 My Fixed Deposit Accounts
      </h2>

      {/* ✅ FD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {fds.map((fd) => {
          const remainingMonths = getRemainingMonths(
            fd.startDate,
            fd.maturityDate
          );

          return (
            <div
              key={fd._id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
            >
              {/* FD Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-400 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  FD #{fd.accountNumber}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    fd.status === "Active"
                      ? "bg-white/20"
                      : fd.status === "Closed"
                      ? "bg-gray-300 text-gray-800"
                      : "bg-yellow-300 text-yellow-900"
                  }`}
                >
                  {fd.status}
                </span>
              </div>

              {/* FD Summary */}
              <div className="p-5 space-y-3 text-sm sm:text-base">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500">Principal</p>
                    <p className="font-semibold flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {Math.round(fd.principal || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Maturity Amount</p>
                    <p className="font-semibold text-green-700 flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {Math.round(fd.maturityAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Interest Rate</p>
                    <p className="font-semibold">{fd.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tenure</p>
                    <p className="font-semibold">{fd.tenureMonths} months</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <strong>Start:</strong>{" "}
                    {new Date(fd.startDate).toLocaleDateString("en-IN")}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <strong>Maturity:</strong>{" "}
                    {new Date(fd.maturityDate).toLocaleDateString("en-IN")}
                  </p>
                </div>

                {/* Remaining Months */}
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span
                    className={`font-semibold ${
                      remainingMonths <= 3
                        ? "text-red-600"
                        : remainingMonths <= 12
                        ? "text-yellow-600"
                        : "text-green-700"
                    }`}
                  >
                    {remainingMonths} months remaining
                  </span>
                </div>

                {/* FD Details */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm space-y-1 border border-gray-100">
                  <p>
                    <strong>Compounding:</strong> {fd.compoundingFrequency}
                  </p>
                  <p>
                    <strong>Payout:</strong> {fd.payoutFrequency}
                  </p>
                  <p>
                    <strong>Auto Renew:</strong> {fd.autoRenew ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Preclosure:</strong>{" "}
                    {fd.preclosureAllowed ? "Allowed" : "Not Allowed"}
                  </p>
                  {fd.preclosureAllowed && (
                    <p>
                      <strong>Penalty:</strong> {fd.preclosurePenaltyPercent}%
                    </p>
                  )}
                  {fd.notes && (
                    <p className="flex items-start gap-1 mt-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>
                        <strong>Notes:</strong> {fd.notes}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberFD;
