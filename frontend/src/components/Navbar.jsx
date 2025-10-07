"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // 👈 import for active route detection
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  User,
  CreditCard,
  PiggyBank,
  Wallet,
  Menu,
  X,
  Settings,
} from "lucide-react";

export default function Navbar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // 👈 current route
  const role = user?.publicMetadata?.role || null;

  // ✅ Admin links
  const adminLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/add-member", label: "Add Member" },
    { href: "/admin/members-list", label: "Members" },
    { href: "/admin/add-loan", label: "Add Loan" },
    { href: "/admin/loans-list", label: "Loan Accounts" },
    { href: "/admin/add-fd", label: "Add FD" },
    { href: "/admin/fd-list", label: "FD Accounts" },
    { href: "/admin/add-rd", label: "Add RD" },
    { href: "/admin/rd-list", label: "RD Accounts" },
    { href: "/admin/add-cd", label: "Add CD" },
    { href: "/admin/cd-list", label: "CD Accounts" },
    { href: "/admin/add-share", label: "Add Share" },
    { href: "/admin/share-list", label: "Shares" },
  ];

  // ✅ Member links
  const memberLinks = [
    { href: "/member/profile", label: "Profile", icon: User },
    { href: "/member/loan", label: "Loan Accounts", icon: Wallet },
    { href: "/member/rd-list", label: "RD Accounts", icon: PiggyBank },
    { href: "/member/fd-list", label: "FD Accounts", icon: CreditCard },
    { href: "/member/settings", label: "Settings", icon: Settings },
  ];

  const links = role === "admin" ? adminLinks : memberLinks;

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex justify-between items-center px-4 md:px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-black shadow-md sticky top-0 z-50"
    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <Image src="/logo1.png" alt="KPT Society Logo" width={32} height={32} />
        <span className="hidden sm:inline">KPT Society</span>
      </Link>

      {/* Middle: Links (Desktop) */}
      <SignedIn>
        <div className="hidden md:flex gap-6">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href; // 👈 check if current route matches link
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors relative ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 hover:text-blue-500"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />} {label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-600 rounded"></span>
                )}
              </Link>
            );
          })}
        </div>
      </SignedIn>

      {/* Right: Buttons */}
      <div className="flex items-center gap-3">
        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="bg-blue-600 text-white font-medium text-sm px-4 py-1.5 rounded-full shadow hover:bg-indigo-500 transition cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-200 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-full bg-white text-gray-800 shadow-md flex flex-col items-start px-6 py-4 gap-4 md:hidden">
          <SignedIn>
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 font-medium w-full ${
                    isActive
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />} {label}
                </Link>
              );
            })}
            <div className="border-t pt-3 w-full flex justify-start">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex flex-col gap-2 w-full">
              <SignInButton>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      )}
    </motion.nav>
  );
}
