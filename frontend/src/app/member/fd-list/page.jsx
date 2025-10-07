"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

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
      console.log(res.data);
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
      <p className="p-6 text-center text-gray-500">Loading FD accounts...</p>
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

  // ✅ Take member details from first FD (since all FDs belong to same member)
  const member = fds[0]?.memberId;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      {/* ✅ Member Info */}
      {member && (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white shadow-md rounded-lg p-4">
          <img
            src={member.photo}
            alt="Member"
            className="w-20 h-20 rounded-full border-2 border-green-400 object-cover"
          />
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold text-green-700">
              {member.name}
            </h3>
            <p className="text-gray-600">
              📞 {member.phone || "Not Available"}
            </p>
            <p className="text-gray-600">📧 {member.email}</p>
          </div>
        </div>
      )}

      {/* ✅ FD Accounts */}
      <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
        💰 My Fixed Deposit Accounts
      </h2>

      {fds.map((fd) => {
        const remainingMonths = getRemainingMonths(
          fd.startDate,
          fd.maturityDate
        );

        return (
          <div
            key={fd._id}
            className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* FD Summary */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Account No</p>
                <p className="font-medium">{fd.accountNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Principal</p>
                <p className="font-medium">₹{fd.principal?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Tenure</p>
                <p className="font-medium">{fd.tenureMonths} months</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Interest</p>
                <p className="font-medium">{fd.interestRate}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Maturity Amount
                </p>
                <p className="font-medium">
                  ₹{fd.maturityAmount?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Maturity Date
                </p>
                <p className="font-medium">
                  {new Date(fd.maturityDate).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Remaining Months
                </p>
                <p
                  className={`font-medium ${
                    remainingMonths <= 3
                      ? "text-red-600"
                      : remainingMonths <= 12
                      ? "text-yellow-600"
                      : "text-green-700"
                  }`}
                >
                  {remainingMonths}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Status</p>
                <p
                  className={`font-medium px-2 py-1 rounded-full text-center ${
                    fd.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : fd.status === "Closed"
                      ? "bg-gray-200 text-gray-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {fd.status}
                </p>
              </div>
            </div>

            {/* FD Details */}
            <div className="p-4 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t text-sm sm:text-base">
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
                <strong>Preclosure Allowed:</strong>{" "}
                {fd.preclosureAllowed ? "Yes" : "No"}
              </p>
              {fd.preclosureAllowed && (
                <p>
                  <strong>Penalty %:</strong> {fd.preclosurePenaltyPercent}%
                </p>
              )}
              {fd.notes && (
                <p className="col-span-2">
                  <strong>Notes:</strong> {fd.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MemberFD;
