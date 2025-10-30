"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

import { Briefcase, Calendar, User } from "lucide-react";

export default function MemberProfileModal({ memberId, onClose }) {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [rds, setRds] = useState([]);
  const [fds, setFds] = useState([]);
  const [cds, setCds] = useState([]);
  const [shares, setShares] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, rdRes, fdRes, cdRes, shareRes, loanRes] =
          await Promise.all([
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/members/${memberId}`,
              { headers }
            ),
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/rd/member/${memberId}`,
              { headers }
            ),
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/fd/member/${memberId}`,
              { headers }
            ),
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/cd/member/${memberId}`,
              { headers }
            ),
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/share/${memberId}`,
              { headers }
            ),
            axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${memberId}`,
              { headers }
            ),
          ]);

        setProfile(profileRes.data);
        setRds(Array.isArray(rdRes.data) ? rdRes.data : [rdRes.data]);
        setFds(Array.isArray(fdRes.data) ? fdRes.data : [fdRes.data]);
        setCds(Array.isArray(cdRes.data) ? cdRes.data : [cdRes.data]);
        setShares(
          Array.isArray(shareRes.data) ? shareRes.data : [shareRes.data]
        );
        setLoans(Array.isArray(loanRes.data) ? loanRes.data : [loanRes.data]);
      } catch (err) {
        console.error("Failed to fetch member details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId]);

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {loading ? (
          <p className="text-center py-10 text-gray-500">Loading profile...</p>
        ) : !profile ? (
          <p className="text-center py-10 text-red-500">Member not found</p>
        ) : (
          <div className="p-6 space-y-5">
            <h2 className="text-xl font-semibold text-indigo-700 text-center">
              👤 {profile.name}
            </h2>

            <div className="flex flex-col md:flex-row gap-5">
              {/* Profile Info */}
              <div className="md:w-1/3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm border p-4">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      profile.photo ||
                      `https://ui-avatars.com/api/?name=${profile.name}`
                    }
                    alt={profile.name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-3"
                  />
                  <Badge label="Role" value={profile.role} color="indigo" />
                  <Badge
                    label="Department"
                    value={profile.department}
                    color="blue"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <InfoItem icon={Mail} label="Email" value={profile.email} />
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={profile.phone || "N/A"}
                  />
                  <InfoItem
                    icon={Home}
                    label="Address"
                    value={profile.currentAddress}
                  />
                </div>
              </div>

              {/* Deposit and Loan Summary */}
              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {rds.length > 0 && (
                  <InfoCard title="Recurring Deposits" color="indigo">
                    <InfoItem label="Accounts" value={rds.length} />
                  </InfoCard>
                )}
                {fds.length > 0 && (
                  <InfoCard title="Fixed Deposits" color="blue">
                    <InfoItem label="Accounts" value={fds.length} />
                  </InfoCard>
                )}
                {cds.length > 0 && (
                  <InfoCard title="Compulsory Deposits" color="emerald">
                    <InfoItem label="Accounts" value={cds.length} />
                  </InfoCard>
                )}
                {shares.length > 0 && (
                  <InfoCard title="Shares" color="amber">
                    <InfoItem label="Accounts" value={shares.length} />
                  </InfoCard>
                )}
                {loans.length > 0 && (
                  <InfoCard title="Loans" color="teal">
                    <InfoItem label="Active Loans" value={loans.length} />
                  </InfoCard>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
