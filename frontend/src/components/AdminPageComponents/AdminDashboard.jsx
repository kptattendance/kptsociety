"use client";

import React from "react";
import { Users, PiggyBank, Wallet, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  // 🔹 Replace with real data from API/DB
  const stats = [
    {
      id: "members",
      label: "Active Members",
      value: 128, // <-- dummy count
      icon: Users,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "rd",
      label: "RD Accounts",
      value: 45,
      icon: PiggyBank,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "fd",
      label: "FD Accounts",
      value: 32,
      icon: Wallet,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "loan",
      label: "Loan Accounts",
      value: 18,
      icon: CreditCard,
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
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
