// components/LoadOverlay.jsx
"use client";
import { Loader2 } from "lucide-react";

export default function LoadOverlay({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-700">Processing, please wait...</p>
      </div>
    </div>
  );
}
