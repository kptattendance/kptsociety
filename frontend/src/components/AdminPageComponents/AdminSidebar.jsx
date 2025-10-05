"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Users,
  CreditCard,
  PiggyBank,
  Wallet,
  Settings,
  Menu,
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 🔹 Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white shadow-sm sticky top-[64px] z-40">
        <h2 className="font-semibold text-gray-800">Menu</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-indigo-600 flex items-center gap-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 🔹 Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="mb-8 border-b border-white/20 pb-4">
          <h2 className="text-xl font-bold">Welcome,</h2>
          <p className="text-lg">{user?.fullName || "Admin"}</p>
          <p className="text-sm text-gray-200">
            {user?.primaryEmailAddress?.emailAddress || "admin@example.com"}
          </p>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md transition ${
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

      {/* 🔹 Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[108px] left-0 w-full bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full text-left px-4 py-2 transition ${
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
