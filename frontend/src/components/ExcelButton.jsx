"use client";

import { FileSpreadsheet } from "lucide-react";

// Themed "Download Excel" button used on every page with data
export default function ExcelButton({
  onClick,
  label = "Download Excel",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 shadow-sm hover:bg-blue-50 hover:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <FileSpreadsheet className="w-4 h-4" />
      {label}
    </button>
  );
}
