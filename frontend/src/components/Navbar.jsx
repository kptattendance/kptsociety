"use client";

import { useEffect, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CreditCard,
  PiggyBank,
  Wallet,
  Menu,
  X,
  Settings,
  Briefcase,
  Shapes,
  LayoutDashboard,
  Users,
  ChevronDown,
} from "lucide-react";

// ✅ Admin links, grouped so they fit on one bar
const adminGroups = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Members",
    icon: Users,
    links: [
      { href: "/admin/add-member", label: "Add Member" },
      { href: "/admin/members-list", label: "Members" },
    ],
  },
  {
    label: "Loans",
    icon: Wallet,
    links: [
      { href: "/admin/add-loan", label: "Add Loan" },
      { href: "/admin/loans-list", label: "Loan Accounts" },
    ],
  },
  {
    label: "FD",
    icon: Briefcase,
    links: [
      { href: "/admin/add-fd", label: "Add FD" },
      { href: "/admin/fd-list", label: "FD Accounts" },
    ],
  },
  {
    label: "RD",
    icon: PiggyBank,
    links: [
      { href: "/admin/add-rd", label: "Add RD" },
      { href: "/admin/rd-list", label: "RD Accounts" },
    ],
  },
  {
    label: "CD",
    icon: CreditCard,
    links: [
      { href: "/admin/add-cd", label: "Add CD" },
      { href: "/admin/cd-list", label: "CD Accounts" },
    ],
  },
  {
    label: "Shares",
    icon: Shapes,
    links: [
      { href: "/admin/add-share", label: "Add Share" },
      { href: "/admin/share-list", label: "Shares" },
    ],
  },
];

// ✅ Member links
const memberLinks = [
  { href: "/member/profile", label: "Profile", icon: User },
  { href: "/member/loan", label: "Loans", icon: Wallet },
  { href: "/member/rd-list", label: "RD", icon: PiggyBank },
  { href: "/member/fd-list", label: "FD", icon: Briefcase },
  { href: "/member/cd-list", label: "CD", icon: CreditCard },
  { href: "/member/shares", label: "Shares", icon: Shapes },
  { href: "/member/settings", label: "Settings", icon: Settings },
];

function AdminDropdown({ group, pathname, openGroup, setOpenGroup }) {
  const Icon = group.icon;
  const isActive = group.links.some((l) => l.href === pathname);
  const isOpen = openGroup === group.label;
  const pillClass = `flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
    isActive
      ? "bg-white text-purple-700 shadow-sm ring-1 ring-purple-200"
      : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
  }`;

  // Single-link groups render as a plain link
  if (group.links.length === 1) {
    return (
      <Link href={group.links[0].href} className={pillClass}>
        <Icon className="w-4 h-4" /> {group.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenGroup(group.label)}
      onMouseLeave={() => setOpenGroup(null)}
    >
      <button
        type="button"
        onClick={() => setOpenGroup(isOpen ? null : group.label)}
        className={pillClass}
        aria-expanded={isOpen}
      >
        <Icon className="w-4 h-4" /> {group.label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full pt-2 min-w-[190px]"
          >
            <div className="bg-white rounded-2xl shadow-soft ring-1 ring-gray-200/70 p-1.5">
              {group.links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpenGroup(null)}
                  className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                    pathname === href
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const pathname = usePathname(); // 👈 current route
  const role = user?.publicMetadata?.role || null;
  const isAdmin = role === "admin";

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-purple-100/80"
    >
      <div className="h-[3px] brand-gradient" />
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-3 px-4 sm:px-6 h-16">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 ring-1 ring-purple-200/60">
            <Image src="/logo1.png" alt="KPT Society Logo" width={28} height={28} />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-gray-900">
              KPT Society
            </span>
            <span className="hidden sm:block text-[11px] font-medium text-gray-500">
              Co-operative Society, Mangalore
            </span>
          </span>
        </Link>

        {/* Middle: Links (Desktop) */}
        <SignedIn>
          <div className="hidden lg:flex items-center gap-1 bg-gray-100/70 rounded-full p-1">
            {isAdmin
              ? adminGroups.map((group) => (
                  <AdminDropdown
                    key={group.label}
                    group={group}
                    pathname={pathname}
                    openGroup={openGroup}
                    setOpenGroup={setOpenGroup}
                  />
                ))
              : memberLinks.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href; // 👈 check if current route matches link
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white text-purple-700 shadow-sm ring-1 ring-purple-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </Link>
                  );
                })}
          </div>
        </SignedIn>

        {/* Right: Buttons */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton>
              <button className="hidden sm:inline-flex items-center gap-2 bg-gray-900 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-sm hover:bg-purple-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="hidden lg:flex items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden grid place-items-center w-10 h-10 rounded-xl text-gray-700 hover:bg-purple-50 transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden absolute inset-x-0 top-full h-[100dvh] bg-gray-900/20"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-purple-100 shadow-soft max-h-[calc(100dvh-67px)] overflow-y-auto"
            >
              <div className="px-4 sm:px-6 py-4 space-y-4">
                <SignedIn>
                  {isAdmin ? (
                    <div className="space-y-4">
                      {adminGroups.map((group) => {
                        const Icon = group.icon;
                        return (
                          <div key={group.label}>
                            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                              <Icon className="w-3.5 h-3.5" /> {group.label}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {group.links.map(({ href, label }) => (
                                <Link
                                  key={href}
                                  href={href}
                                  onClick={() => setIsOpen(false)}
                                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    pathname === href
                                      ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 ring-1 ring-purple-200"
                                      : "bg-gray-50 text-gray-700 hover:bg-purple-50"
                                  }`}
                                >
                                  {label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {memberLinks.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 ring-1 ring-purple-200"
                                : "bg-gray-50 text-gray-700 hover:bg-purple-50"
                            }`}
                          >
                            <Icon className="w-4 h-4" /> {label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.fullName || "My Account"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                </SignedIn>

                <SignedOut>
                  <SignInButton>
                    <button className="w-full bg-gray-900 hover:bg-purple-700 text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-sm transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
