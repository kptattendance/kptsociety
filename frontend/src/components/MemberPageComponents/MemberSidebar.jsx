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
  { id: "/member-my-profile", label: "My Profile", icon: Home },
  { id: "/member-rd-list", label: "My RD", icon: PiggyBank },
  { id: "/add-fd", label: "My FD", icon: Wallet },
  { id: "/member-loan", label: "My Loan", icon: CreditCard },
  { id: "/settings", label: "Settings", icon: Settings },
];

export default function MemberSidebar({ selected, setSelected }) {
  const { user } = useUser();

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-indigo-600 to-purple-700 text-white flex flex-col p-6 shadow-lg">
      {/* Admin Info */}
      <div className="mb-8 border-b border-white/20 pb-4">
        <h2 className="text-xl font-bold">Welcome,</h2>
        <p className="text-lg">{user?.fullName || null}</p>
        <p className="text-sm text-gray-200">
          {user?.primaryEmailAddress?.emailAddress || null}
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
