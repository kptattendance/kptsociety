"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay";
import Papa from "papaparse";
import { toast } from "react-toastify";

export default function AdminShareBulkUpload() {
  const { getToken } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload CSV
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first!");
      return;
    }

    setLoading(true);

    // Parse CSV using PapaParse
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;

        try {
          const token = await getToken();

          for (const row of rows) {
            // Expected CSV columns: memberId, sharesBought, sharePrice, paymentMode, reference, notes
            const payload = {
              memberId: row.memberId,
              sharesBought: Number(row.sharesBought),
              sharePrice: row.sharePrice ? Number(row.sharePrice) : 100,
              paymentMode: row.paymentMode || "cash",
              reference: row.reference || "",
              notes: row.notes || "",
            };

            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/share`,
              payload,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }

          toast.success("✅ Bulk share upload completed successfully!");
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.error || "❌ Error uploading shares");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        console.error(err);
        toast.error("❌ Failed to parse CSV");
        setLoading(false);
      },
    });
  };

  return (
    <div className="min-h bg-gradient-to-br from-pink-100 via-indigo-100 to-teal-100 p-4 sm:p-8">
      <LoadOverlay show={loading} />

      <div className="bg-white/80 backdrop-blur-2xl shadow-soft rounded-3xl p-5 sm:p-10 w-full max-w-3xl mx-auto border border-white/50">
        <h1 className="text-2xl font-extrabold text-center bg-gradient-to-r from-pink-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent mb-10 drop-shadow-md">
          💠 Bulk Upload Member Shares
        </h1>

        <div className="grid gap-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="border p-3 rounded-lg"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn btn-primary !py-3 !px-8 w-full"
          >
            {loading ? "Uploading..." : "✨ Upload CSV"}
          </button>

          <p className="text-sm text-gray-500">
            CSV Format:{" "}
            <strong>
              memberId, sharesBought, sharePrice, paymentMode, reference, notes
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
