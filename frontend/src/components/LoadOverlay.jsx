// components/LoadOverlay.jsx
"use client";
import { Loader2 } from "lucide-react";

export default function LoadOverlay({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white px-8 py-6 rounded-3xl shadow-soft ring-1 ring-purple-100 flex flex-col items-center gap-3">
        <span className="grid place-items-center w-14 h-14 rounded-2xl brand-gradient">
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        </span>
        <p className="text-sm font-medium text-gray-700">Processing, please wait...</p>
      </div>
    </div>
  );
}
