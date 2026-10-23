"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

// Admin pages render only for admins; everyone else is sent away before any
// admin screen (or its data requests) loads.
export default function AdminLayout({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const isAdmin = user?.publicMetadata?.role === "admin";

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.replace("/");
    else if (!isAdmin) router.replace("/unauthorized");
  }, [isLoaded, isSignedIn, isAdmin, router]);

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return children;
}
