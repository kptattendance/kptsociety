// "use client";

// import React, { useState } from "react";
// import AdminSidebar from "../../components/AdminPageComponents/AdminSidebar";
// import AdminAddMember from "./add-member/page";
// import AdminDashboard from "./AdminDashboard";
// import MembersList from "./members-list/page";
// import AdminLoanApplicationForm from "./add-loan/page";
// import AdminLoanList from "./loans-list/page";
// import AdminFDForm from "./add-fd/page";
// import AdminFDTable from "./fd-list/page";
// import AdminRDForm from "./add-rd/page";
// import AdminRDTable from "./rd-list/page";

// export default function AdminPage() {
//   const [selected, setSelected] = useState("/admindashboard");

//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       <div className="flex flex-1">
//         {/* Sidebar (Responsive inside component) */}
//         <div className="md:w-64">
//           <AdminSidebar selected={selected} setSelected={setSelected} />
//         </div>

//         {/* Main Content */}
//         <main className="flex-1 px-4 md:px-6 py-8 bg-gray-50 overflow-y-auto">
//           <div className="max-w-6xl mx-auto">
//             {selected === "/admindashboard" && <AdminDashboard />}
//             {selected === "/add-member" && <AdminAddMember />}
//             {selected === "/members-list" && <MembersList />}
//             {selected === "/add-loan" && <AdminLoanApplicationForm />}
//             {selected === "/loan-list" && <AdminLoanList />}
//             {selected === "/add-fd" && <AdminFDForm />}
//             {selected === "/fd-list" && <AdminFDTable />}
//             {selected === "/add-rd" && <AdminRDForm />}
//             {selected === "/rd-list" && <AdminRDTable />}

//             {selected === "/settings" && (
//               <div className="bg-white p-6 rounded-lg shadow">
//                 <h2 className="text-2xl font-semibold mb-2">Settings</h2>
//                 <p className="text-sm text-gray-600">
//                   Admin-level settings and preferences.
//                 </p>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState } from "react";
import { Users, PiggyBank, Wallet, CreditCard } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getToken]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 sm:h-36 rounded-3xl bg-purple-100/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-red-500 text-center mt-8">Failed to load stats.</p>
    );
  }

  const dashboardCards = [
    {
      id: "members",
      label: "Active Members",
      value: stats.members,
      icon: Users,
      gradient: "bg-gradient-to-br from-blue-200 to-blue-100",
      iconBg: "bg-blue-600",
    },
    {
      id: "rd",
      label: "RD Accounts",
      value: stats.rds,
      icon: PiggyBank,
      gradient: "bg-gradient-to-br from-pink-200 to-pink-100",
      iconBg: "bg-pink-600",
    },
    {
      id: "fd",
      label: "FD Accounts",
      value: stats.fds,
      icon: Wallet,
      gradient: "bg-gradient-to-br from-purple-300 to-purple-100",
      iconBg: "bg-purple-600",
    },
    {
      id: "loan",
      label: "Loan Accounts",
      value: stats.loans,
      icon: CreditCard,
      gradient: "bg-gradient-to-br from-pink-300 to-pink-100",
      iconBg: "bg-pink-700",
    },
    {
      id: "cd",
      label: "CD Accounts",
      value: stats.cds, // ✅ New
      icon: Wallet,
      gradient: "bg-gradient-to-br from-blue-300 to-blue-100",
      iconBg: "bg-blue-700",
    },
    {
      id: "shares",
      label: "Shares",
      value: stats.shares, // ✅ New
      icon: PiggyBank,
      gradient: "bg-gradient-to-br from-purple-200 to-purple-50",
      iconBg: "bg-purple-700",
    },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
          Overview
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {dashboardCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`relative overflow-hidden rounded-3xl p-4 sm:p-6 ring-1 ring-white/70 shadow-soft hover:-translate-y-0.5 transition-transform duration-300 ${stat.gradient}`}
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/40"></div>
              <div className="relative flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
                    {stat.label}
                  </h3>
                  <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1 sm:mt-2">
                    {stat.value}
                  </p>
                </div>

                <div className={`grid place-items-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl text-white shadow-md ${stat.iconBg}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
