"use client";

import { useUser } from "@clerk/nextjs";
import {
  Home,
  Users,
  CreditCard,
  PiggyBank,
  Wallet,
  Settings,
} from "lucide-react";

const menuItems = [
  { id: "/admindashboard", label: "Dashboard", icon: Home },
  { id: "/add-member", label: "Add Member", icon: Users },
  { id: "/members-list", label: "Members List", icon: Users },
  { id: "/add-rd", label: "Add RD", icon: PiggyBank },
  { id: "/rd-list", label: "RD List", icon: PiggyBank },
  { id: "/add-fd", label: "Add FD", icon: Wallet },
  { id: "/fd-list", label: "FD List", icon: Wallet },
  { id: "/add-loan", label: "Add Loan", icon: CreditCard },
  { id: "/loan-list", label: "Loan List", icon: CreditCard },
  { id: "/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ selected, setSelected }) {
  const { user } = useUser();

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-indigo-600 to-purple-700 text-white flex flex-col p-6 shadow-lg">
      {/* Admin Info */}
      <div className="mb-8 border-b border-white/20 pb-4">
        <h2 className="text-xl font-bold">Welcome,</h2>
        <p className="text-lg">{user?.fullName || "Admin"}</p>
        <p className="text-sm text-gray-200">
          {user?.primaryEmailAddress?.emailAddress || "admin@example.com"}
        </p>
      </div>

      {/* Sidebar Menu */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition
                ${
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
