"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Lock } from "lucide-react";
import LoadOverlay from "../../../components/LoadOverlay";
import CDScheduleModal from "./CDScheduleModal";
import { toast } from "react-toastify";

export default function AdminCDList() {
  const { getToken } = useAuth();
  const [cds, setCDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching CDs...");
  const [selectedCDId, setSelectedCDId] = useState(null);

  // Fetch all CDs
  const fetchCDs = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Fetching CDs...");
      const token = await getToken();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCDs(res.data);
    } catch (error) {
      console.error("Error fetching CDs:", error);
      toast.error("Failed to fetch CDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCDs();
  }, []);

  // Delete CD
  const handleDelete = async (cdId) => {
    if (!confirm("Are you sure you want to delete this CD?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Deleting CD...");
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("CD deleted successfully");
      fetchCDs();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete CD");
      setLoading(false);
    }
  };

  // Close CD
  const handleClose = async (cdId) => {
    if (!confirm("Close this CD account?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Closing CD...");
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd/${cdId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("CD closed successfully");
      fetchCDs();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("Failed to close CD");
      setLoading(false);
    }
  };

  // Refresh when modal updates or closes
  const handleModalClose = (updated = false) => {
    setSelectedCDId(null);
    if (updated) fetchCDs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-50 to-pink-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">
          💰 CD Accounts
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-teal-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Account #</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Monthly Deposit (₹)</th>
                <th className="px-4 py-2 text-left">Total Deposited</th>
                <th className="px-4 py-2 text-left">Total Withdrawn</th>
                <th className="px-4 py-2 text-left">Balance</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
                <th className="px-4 py-2 text-center">Schedule</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {!loading && cds.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No CD accounts found.
                  </td>
                </tr>
              )}

              {cds.map((cd) => (
                <tr key={cd._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{cd.accountNumber}</td>

                  <td className="px-4 py-2 flex items-center gap-3">
                    <img
                      src={cd.memberId?.photo || "/default-avatar.png"}
                      alt={cd.memberId?.name || "Member"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium">
                        {cd.memberId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cd.memberId?.phone || "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    ₹{cd.monthlyDeposit?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    ₹{cd.totalDeposited?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    ₹{cd.totalWithdrawn?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">₹{cd.balance?.toLocaleString()}</td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cd.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : cd.status === "Closed"
                          ? "bg-gray-200 text-gray-600"
                          : cd.status === "Partial"
                          ? "bg-yellow-100 text-yellow-700"
                          : ""
                      }`}
                    >
                      {cd.status}
                    </span>
                  </td>

                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleDelete(cd._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                    {cd.status === "Active" && (
                      <button
                        onClick={() => handleClose(cd._id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Lock size={16} />
                      </button>
                    )}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedCDId(cd._id)}
                      className="text-teal-500 cursor-pointer hover:text-green-700 font-medium"
                    >
                      Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedCDId && (
            <CDScheduleModal cdId={selectedCDId} onClose={handleModalClose} />
          )}
        </div>
      </div>
    </div>
  );
}
