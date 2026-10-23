"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { exportFile } from "../utils/exportFile";

/**
 * Excel + PDF download buttons.
 * Either pass `fileName` + `getSheets` (and optional `title` for the PDF),
 * or `onExport(format)` for pages that build their own export.
 */
export default function ExportButtons({
  fileName,
  getSheets,
  title,
  onExport,
  disabled = false,
  compact = false,
  className = "",
}) {
  const [busy, setBusy] = useState(null);

  const run = async (format) => {
    try {
      setBusy(format);
      if (onExport) await onExport(format);
      else
        await exportFile(format, fileName, getSheets(), {
          title: title ?? fileName?.replace(/_/g, " "),
        });
    } catch (err) {
      console.error(err);
      toast.error(`Could not create the ${format === "pdf" ? "PDF" : "Excel"} file`);
    } finally {
      setBusy(null);
    }
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`inline-flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => run("excel")}
        disabled={disabled || !!busy}
        className={`${base} text-blue-700 ring-blue-200 hover:bg-blue-50`}
      >
        {busy === "excel" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        {compact ? "Excel" : "Download Excel"}
      </button>
      <button
        type="button"
        onClick={() => run("pdf")}
        disabled={disabled || !!busy}
        className={`${base} text-pink-700 ring-pink-200 hover:bg-pink-50`}
      >
        {busy === "pdf" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        {compact ? "PDF" : "Download PDF"}
      </button>
    </div>
  );
}
