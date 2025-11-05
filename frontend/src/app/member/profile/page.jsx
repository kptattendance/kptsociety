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
  const [rds, setRds] = useState([]);
  const [fds, setFds] = useState([]);
  const [cds, setCds] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      const token = await getToken();

      // Member profile
      try {
        const profileRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/members/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(profileRes.data);
      } catch (err) {
        console.error("Error fetching member profile:", err);
      }

      // Loan details
      try {
        const loanRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLoans(Array.isArray(loanRes.data) ? loanRes.data : [loanRes.data]);
      } catch (err) {
        console.error("Error fetching loan details:", err);
      }

      // RD details
      try {
        const rdRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rd/member/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = rdRes.data;
        // ✅ Normalize RD data into an array
        const rdArray = data?.rdAccounts
          ? data.rdAccounts // multiple RDs
          : data?.rdAccount
          ? [data.rdAccount] // single RD
          : Array.isArray(data)
          ? data
          : data
          ? [data]
          : [];

        setRds(rdArray);
      } catch (err) {
        console.error("Error fetching RD details:", err);
      }

      // FD details
      try {
        const fdRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/fd/member/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(fdRes);
        setFds(Array.isArray(fdRes.data) ? fdRes.data : [fdRes.data]);
      } catch (err) {
        console.error("Error fetching FD details:", err);
      }

      // CD details
      try {
        const cdRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cd/member/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(cdRes);
        setCds(Array.isArray(cdRes.data) ? cdRes.data : [cdRes.data]);
      } catch (err) {
        console.error("Error fetching CD details:", err);
      }

      // Share details
      try {
        const shareRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/share/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(shareRes);

        const data = shareRes.data;
        const shareArray = data?.shareAccount
          ? [data.shareAccount] // ✅ extract the nested object
          : Array.isArray(data)
          ? data
          : data
          ? [data]
          : [];

        setShares(shareArray);
      } catch (err) {
        console.error("Error fetching share details:", err);
      }
    } catch (err) {
      console.error("Error in fetchData setup:", err);
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

  // ✅ Computations
  const totalLoanAmount = loans.reduce(
    (acc, loan) => acc + (loan.loanAmount || 0),
    0
  );
  const pendingPrincipal = loans.reduce(
    (acc, loan) =>
      acc +
      (loan.repayments
        ? loan.repayments
            .filter((r) => r.status !== "Paid")
            .reduce((a, r) => a + (r.principal || 0), 0)
        : 0),
    0
  );
  const pendingInstallments = loans.reduce(
    (acc, loan) =>
      acc +
      (loan.repayments
        ? loan.repayments.filter((r) => r.status !== "Paid").length
        : 0),
    0
  );

  const totalFD = fds.reduce((acc, fd) => acc + (fd.principal || 0), 0);
  const totalCD = cds.reduce((acc, cd) => acc + (cd.balance || 0), 0);

  // 🟡 RD: use totalDeposited if availableBalance is 0 or undefined
  const totalRD = rds.reduce(
    (acc, rd) =>
      acc +
      (rd.availableBalance > 0 ? rd.availableBalance : rd.totalDeposited || 0),
    0
  );

  // 🟣 Shares: use currentAmountBalance or totalAmount
  const totalShares = shares.reduce(
    (acc, s) =>
      acc + (s.currentAmountBalance || s.totalAmount || s.amount || 0),
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
          <div className="bg-indigo-900 text-white text-center px-4 py-6">
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <p className="text-indigo-200 text-sm">{profile.designation}</p>
          </div>

          <div className="px-4 pb-4 flex flex-col items-center space-y-3 mt-4">
            <img
              src={
                profile.photo ||
                `https://ui-avatars.com/api/?name=${profile.name}`
              }
              alt={profile.name}
              className="w-24 h-24 rounded-full shadow-lg border-4 border-white object-cover -mt-8"
            />
            <div className="w-full flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <Badge label="Role" value={profile.role} color="indigo" />
              <Badge
                label="Department"
                value={profile.department}
                color="blue"
              />
            </div>

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

        {/* Other Info */}
        <div className="md:col-span-2 grid gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* 🟢 Loan Summary */}
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

          {/* 🟡 RD, FD, CD, Share Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rds.length > 0 && (
              <InfoCard title="Recurring Deposit Summary" color="indigo">
                <InfoItem
                  label="Number of RD Accounts"
                  value={rds.length}
                  iconColor="text-indigo-600"
                />
                <InfoItem
                  label="Total RD Balance"
                  value={`₹${totalRD.toLocaleString()}`}
                  iconColor="text-indigo-600"
                />
              </InfoCard>
            )}

            {fds.length > 0 && (
              <InfoCard title="Fixed Deposit Summary" color="blue">
                <InfoItem
                  label="Number of FD Accounts"
                  value={fds.length}
                  iconColor="text-blue-600"
                />
                <InfoItem
                  label="Total FD Amount"
                  value={`₹${totalFD.toLocaleString()}`}
                  iconColor="text-blue-600"
                />
              </InfoCard>
            )}

            {cds.length > 0 && (
              <InfoCard title="Compulsory Deposit Summary" color="emerald">
                <InfoItem
                  label="Number of CD Accounts"
                  value={cds.length}
                  iconColor="text-emerald-600"
                />
                <InfoItem
                  label="Total CD Balance"
                  value={`₹${totalCD.toLocaleString()}`}
                  iconColor="text-emerald-600"
                />
              </InfoCard>
            )}

            {shares.length > 0 && (
              <InfoCard title="Shares Summary" color="amber">
                <InfoItem
                  label="Number of Share Accounts"
                  value={shares.length}
                  iconColor="text-amber-600"
                />
                <InfoItem
                  label="Total Share Value"
                  value={`₹${totalShares.toLocaleString()}`}
                  iconColor="text-amber-600"
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

// Info Card
const InfoCard = ({ title, children, color }) => {
  const colorClasses = {
    pink: { bg: "from-pink-50 to-pink-100", header: "bg-pink-900 text-white" },
    purple: {
      bg: "from-purple-50 to-purple-100",
      header: "bg-purple-900 text-white",
    },
    teal: { bg: "from-teal-50 to-teal-100", header: "bg-teal-900 text-white" },
    blue: { bg: "from-blue-50 to-blue-100", header: "bg-blue-900 text-white" },
    indigo: {
      bg: "from-indigo-50 to-indigo-100",
      header: "bg-indigo-900 text-white",
    },
    emerald: {
      bg: "from-emerald-50 to-emerald-100",
      header: "bg-emerald-900 text-white",
    },
    amber: {
      bg: "from-amber-50 to-amber-100",
      header: "bg-amber-900 text-white",
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

// Badge
const Badge = ({ label, value, color }) => (
  <div
    className={`flex justify-between px-2 py-1 rounded-md bg-${color}-100 text-${color}-700 text-sm font-medium`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
