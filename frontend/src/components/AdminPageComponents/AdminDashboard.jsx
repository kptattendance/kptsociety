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
      <p className="text-gray-500 text-center mt-8">Loading dashboard...</p>
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
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "rd",
      label: "RD Accounts",
      value: stats.rds,
      icon: PiggyBank,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "fd",
      label: "FD Accounts",
      value: stats.fds,
      icon: Wallet,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "loan",
      label: "Loan Accounts",
      value: stats.loans,
      icon: CreditCard,
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {dashboardCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <h3 className="text-gray-500 text-sm font-medium">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stat.value}
              </p>
            </div>
            <div
              className={`p-4 rounded-full bg-gradient-to-r ${stat.color} text-white shadow-md`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
