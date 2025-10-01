"use client";
import { useState } from "react";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Home,
  Users,
  CreditCard,
  User,
  PiggyBank,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const role = user?.publicMetadata?.role || null;

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/members", label: "Manage Members", icon: Users },
    { href: "/transactions", label: "Transactions", icon: CreditCard },
  ];

  const memberLinks = [
    { href: "/member", label: "Dashboard", icon: User },
    { href: "/savings", label: "My Savings", icon: PiggyBank },
    { href: "/loans", label: "My Loans", icon: Wallet },
  ];

  const links = role === "admin" ? adminLinks : memberLinks;

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex justify-between items-center px-6 py-3 bg-white shadow-lg sticky top-0 z-50"
    >
      {/* Left: Logo + App Name */}
      <a
        href="/"
        className="flex items-center gap-2 text-xl font-bold text-indigo-600"
      >
        <Image src="/logo1.png" alt="KPT Society Logo" width={32} height={32} />
        <span>KPT Society</span>
      </a>

      {/* Middle: Navigation Links (Desktop) */}
      <SignedIn>
        <div className="hidden md:flex gap-6">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              <Icon className="w-4 h-4" /> {label}
            </a>
          ))}
        </div>
      </SignedIn>

      {/* Right: Auth Controls + Mobile Menu Button */}
      <div className="flex items-center gap-4">
        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm px-4 py-2 shadow-md transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Toggle */}
        <SignedIn>
          <button
            className="md:hidden p-2 text-gray-700 hover:text-indigo-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </SignedIn>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <SignedIn>
          <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-start px-6 py-4 gap-4 md:hidden">
            {links.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-4 h-4" /> {label}
              </a>
            ))}

            <div className="flex flex-col gap-2 w-full border-t pt-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>
      )}

      {/* Mobile SignIn/SignUp when signed out */}
      <SignedOut>
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-start px-6 py-4 gap-4 md:hidden">
            <SignInButton>
              <button className="text-left text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm px-4 py-2 shadow-md transition-colors w-full">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </SignedOut>
    </motion.nav>
  );
}
