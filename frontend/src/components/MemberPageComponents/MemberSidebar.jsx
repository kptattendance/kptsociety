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
  X,
} from "lucide-react";

const menuItems = [
  { id: "/member-my-profile", label: "My Profile", icon: Home },
  { id: "/member-rd-list", label: "My RD", icon: PiggyBank },
  { id: "/member-fd-list", label: "My FD", icon: Wallet },
  { id: "/member-loan", label: "My Loan", icon: CreditCard },
  { id: "/settings", label: "Settings", icon: Settings },
];

export default function MemberSidebar({ selected, setSelected }) {
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="sm:hidden flex items-center justify-between p-4 bg-indigo-600 text-white shadow-md">
        <div>
          <h2 className="font-bold">Menu</h2>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="focus:outline-none"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-indigo-600 text-white p-4  space-y-2">
          <div className="border-b border-white/20 pb-2 mb-2">
            <h2 className="text-lg font-bold">Welcome,</h2>
            <p className="text-sm">{user?.fullName || null}</p>
            <p className="text-xs text-gray-200">
              {user?.primaryEmailAddress?.emailAddress || null}
            </p>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item.id);
                  setMobileOpen(false); // close menu after selecting
                }}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-md transition
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
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex h-screen w-64 bg-gradient-to-b from-indigo-600 to-purple-700 text-white flex-col p-6 shadow-lg">
        {/* User Info */}
        <div className="mb-8 border-b border-white/20 pb-4">
          <h2 className="text-xl font-bold">Welcome,</h2>
          <p className="text-lg">{user?.fullName || null}</p>
          <p className="text-sm text-gray-200">
            {user?.primaryEmailAddress?.emailAddress || null}
          </p>
        </div>

        {/* Menu */}
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
    </>
  );
}
