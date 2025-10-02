"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";
import { Mail, Phone, Calendar, Home, Briefcase, User } from "lucide-react";

export default function UserProfile() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      const token = await getToken();

      const profileRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/members/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(profileRes.data);

      const loanRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const loansArray = Array.isArray(loanRes.data)
        ? loanRes.data
        : [loanRes.data];
      setLoans(loansArray);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading)
    return (
      <p className="p-4 text-center text-gray-500">Loading dashboard...</p>
    );
  if (!profile)
    return <p className="p-4 text-center text-red-500">Profile not found.</p>;

  const totalLoanAmount = loans.reduce((acc, loan) => acc + loan.loanAmount, 0);
  const pendingPrincipal = loans.reduce(
    (acc, loan) =>
      acc +
      loan.repayments
        .filter((r) => r.status === "Pending")
        .reduce((a, r) => a + r.principal, 0),
    0
  );
  const pendingInstallments = loans.reduce(
    (acc, loan) =>
      acc + loan.repayments.filter((r) => r.status === "Pending").length,
    0
  );

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-indigo-700">
        👤 Member Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-md rounded-xl border border-indigo-200/50 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-900 text-white text-center px-3 sm:px-4 py-4 sm:py-6">
            <h3 className="text-base sm:text-lg font-semibold">
              {profile.name}
            </h3>
            <p className="text-indigo-200 text-xs sm:text-sm">
              {profile.designation}
            </p>
          </div>

          {/* Body */}
          <div className="px-3 sm:px-4 pb-4 flex flex-col items-center space-y-3 mt-4">
            {/* Avatar */}
            <img
              src={
                profile.photo ||
                `https://ui-avatars.com/api/?name=${profile.name}`
              }
              alt={profile.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-lg border-4 border-white object-cover -mt-8"
            />

            {/* Badges */}
            <div className="w-full flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <Badge label="Role" value={profile.role} color="indigo" />
              <Badge
                label="Department"
                value={profile.department}
                color="blue"
              />
            </div>

            {/* Contact Info */}
            <div className="w-full space-y-2 pt-3 border-t border-indigo-100">
              <InfoItem
                icon={Mail}
                label="Email"
                value={profile.email}
                iconColor="text-blue-600"
              />
              <InfoItem
                icon={Phone}
                label="Phone"
                value={profile.phone || "N/A"}
                iconColor="text-green-600"
              />
            </div>
          </div>
        </div>

        {/* Other Info & Loan Summary */}
        <div className="md:col-span-2 grid gap-3 sm:gap-4">
          <InfoCard title="Addresses" color="pink">
            <InfoItem
              icon={Home}
              label="Permanent Address"
              value={profile.permanentAddress}
              iconColor="text-pink-500"
            />
            <InfoItem
              icon={Home}
              label="Current Address"
              value={profile.currentAddress}
              iconColor="text-pink-500"
            />
          </InfoCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <InfoCard title="Professional Info" color="purple">
              <InfoItem
                icon={Briefcase}
                label="Working College"
                value={profile.workingCollegeName}
                iconColor="text-purple-500"
              />
              <InfoItem
                icon={Calendar}
                label="Date of Birth"
                value={
                  profile.dob
                    ? new Date(profile.dob).toLocaleDateString()
                    : "N/A"
                }
                iconColor="text-purple-500"
              />
              <InfoItem
                icon={User}
                label="Guardian"
                value={profile.guardian}
                iconColor="text-purple-500"
              />
              <InfoItem
                icon={User}
                label="KGID Number"
                value={profile.kgidNumber}
                iconColor="text-purple-500"
              />
            </InfoCard>

            {loans.length > 0 && (
              <InfoCard title="Loan Summary" color="teal">
                <InfoItem
                  label="Total Loan Amount"
                  value={`₹${totalLoanAmount.toLocaleString()}`}
                  iconColor="text-teal-600"
                />
                <InfoItem
                  label="Pending Principal"
                  value={`₹${pendingPrincipal.toLocaleString()}`}
                  iconColor="text-teal-600"
                />
                <InfoItem
                  label="Pending Installments"
                  value={pendingInstallments}
                  iconColor="text-teal-600"
                />
                <InfoItem
                  label="Number of Loans"
                  value={loans.length}
                  iconColor="text-teal-600"
                />
              </InfoCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Info Item
const InfoItem = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-gray-500",
}) => (
  <div className="flex items-center gap-6">
    {Icon ? (
      <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
    ) : (
      <span className={`w-5 h-5 ${iconColor} font-bold`}>₹</span>
    )}
    <div>
      <p className="text-gray-400 text-sm font-semibold">{label}</p>
      <p className="text-gray-700 text-base font-semibold">{value}</p>
    </div>
  </div>
);

// Card Component
const InfoCard = ({ title, children, color }) => {
  // Map colors to gradient + darker header bg
  const colorClasses = {
    pink: {
      bg: "from-pink-50 to-pink-100",
      header: "bg-pink-900 text-white",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      header: "bg-purple-900 text-white",
    },
    teal: {
      bg: "from-teal-50 to-teal-100",
      header: "bg-teal-900 text-white",
    },
  };

  const { bg, header } = colorClasses[color] || {
    bg: "from-gray-50 to-gray-100",
    header: "bg-gray-900 text-white",
  };

  return (
    <div
      className={`bg-gradient-to-br ${bg} shadow rounded-xl border border-gray-200`}
    >
      <h3
        className={`text-sm tracking-wide font-semibold px-3 py-2 rounded-t-xl ${header}`}
      >
        {title}
      </h3>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
};

// Badge Component
const Badge = ({ label, value, color }) => (
  <div
    className={`flex justify-between px-2 py-1 rounded-md bg-${color}-100 text-${color}-700 text-sm font-medium`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
