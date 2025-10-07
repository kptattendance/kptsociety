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
      <p className="text-gray-500 text-center mt-8 animate-pulse">
        Loading dashboard...
      </p>
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
      gradient: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600",
    },
    {
      id: "rd",
      label: "RD Accounts",
      value: stats.rds,
      icon: PiggyBank,
      gradient: "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600",
    },
    {
      id: "fd",
      label: "FD Accounts",
      value: stats.fds,
      icon: Wallet,
      gradient: "bg-gradient-to-br from-fuchsia-400 via-pink-500 to-rose-500",
    },
    {
      id: "loan",
      label: "Loan Accounts",
      value: stats.loans,
      icon: CreditCard,
      gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500",
    },
    {
      id: "cd",
      label: "CD Accounts",
      value: stats.cds, // ✅ New
      icon: Wallet,
      gradient: "bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500",
    },
    {
      id: "shares",
      label: "Shares",
      value: stats.shares, // ✅ New
      icon: PiggyBank,
      gradient: "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 text-center">
        📊 Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {dashboardCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`relative overflow-hidden rounded-2xl shadow-lg transform hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ${stat.gradient} text-white`}
            >
              {/* glossy overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

              {/* main content */}
              <div className="relative p-5 sm:p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-medium opacity-90">
                    {stat.label}
                  </h3>
                  <p className="text-3xl sm:text-4xl font-bold mt-2 drop-shadow-md">
                    {stat.value}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-white/20 rounded-full shadow-md backdrop-blur-sm">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* bottom glossy reflection */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/10 rounded-t-[100%] blur-2xl"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
