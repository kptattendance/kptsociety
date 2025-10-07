"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Pencil, Trash2, Check, X, Lock } from "lucide-react";
import RDScheduleModal from "../../../components/AdminPageComponents/RDScheduleModal";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";

export default function AdminRDTable() {
  const { getToken } = useAuth();
  const [rds, setRDs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Fetching RDs...");
  const [message, setMessage] = useState("");
  const [selectedRDId, setSelectedRDId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const fetchRDs = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Fetching RDs...");
      const token = await getToken();
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rd`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRDs(res.data);
    } catch (error) {
      console.error("Error fetching RDs:", error);
      toast.error("Failed to fetch RDs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRDs();
  }, []);

  const handleDelete = async (rdId) => {
    if (!confirm("Are you sure you want to delete this RD?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Deleting RD...");
      const token = await getToken();
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("RD deleted successfully");
      fetchRDs();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete RD");
      setLoading(false);
    }
  };

  const handleEditClick = (rd) => {
    setEditingId(rd._id);
    setEditForm({
      depositAmount: rd.depositAmount,
      interestRate: rd.interestRate,
      tenureMonths: rd.tenureMonths,
      dueDayOfMonth: rd.dueDayOfMonth,
      gracePeriodDays: rd.gracePeriodDays,
      lateFeePerInstallment: rd.lateFeePerInstallment,
      notes: rd.notes || "",
      status: rd.status,
    });
  };

  const handleSave = async (rdId) => {
    try {
      setLoading(true);
      setLoadingMessage("Updating RD...");
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      toast.success("RD updated successfully");
      fetchRDs();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update RD");
      setLoading(false);
    }
  };

  const handleClose = async (rdId) => {
    if (!confirm("Close this RD?")) return;
    try {
      setLoading(true);
      setLoadingMessage("Closing RD...");
      const token = await getToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/close/${rdId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("RD closed successfully");
      fetchRDs();
    } catch (error) {
      console.error("Close failed:", error);
      toast.error("Failed to close RD");
      setLoading(false);
    }
  };

  // Filtered RDs
  const filteredRDs = rds.filter((rd) => {
    const name = rd.memberId?.name?.toLowerCase() || "";
    const phone = rd.memberId?.phone?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRDs.length / rowsPerPage);
  const paginatedRDs = filteredRDs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredRDs, totalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-teal-100 p-6">
      <LoadOverlay show={loading} message={loadingMessage} />

      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">
          💰 Recurring Deposit Records
        </h2>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 w-80 focus:ring-2 focus:ring-teal-400 outline-none"
          />
        </div>

        {message && (
          <div
            className={`mb-4 text-center font-medium ${
              message.includes("✅") || message.includes("🗑️")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-teal-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Sl. No</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Deposit (₹)</th>
                <th className="px-4 py-2 text-left">Interest (%)</th>
                <th className="px-4 py-2 text-left">Tenure (Months)</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">Maturity Date</th>
                <th className="px-4 py-2 text-left">Maturity Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
                <th className="px-4 py-2 text-center">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {!loading && filteredRDs.length === 0 && (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No RDs found.
                  </td>
                </tr>
              )}

              {paginatedRDs.map((rd, index) => (
                <tr key={rd._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700 font-medium">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2 flex items-center gap-3">
                    <img
                      src={rd.memberId?.photo || "/default-avatar.png"}
                      alt={rd.memberId?.name || "Member"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium">
                        {rd.memberId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rd.memberId?.phone || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-700">
                    ₹{rd.depositAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === rd._id ? (
                      <input
                        type="number"
                        value={editForm.interestRate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            interestRate: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-16 text-center"
                      />
                    ) : (
                      `${rd.interestRate}%`
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === rd._id ? (
                      <input
                        type="number"
                        value={editForm.tenureMonths}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tenureMonths: e.target.value,
                          })
                        }
                        className="border rounded-md px-2 py-1 w-20 text-center"
                      />
                    ) : (
                      rd.tenureMonths
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(rd.startDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(rd.maturityDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-700">
                    ₹{rd.maturityAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === rd._id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="border rounded-md px-2 py-1"
                      >
                        <option>Active</option>
                        <option>Matured</option>
                        <option>Closed</option>
                        <option>PreClosed</option>
                        <option>Defaulted</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rd.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : rd.status === "Closed" || rd.status === "Matured"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {rd.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    {editingId === rd._id ? (
                      <>
                        <button
                          onClick={() => handleSave(rd._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(rd)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rd._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                        {rd.status === "Active" && (
                          <button
                            onClick={() => handleClose(rd._id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => setSelectedRDId(rd._id)}
                      className="text-teal-500 cursor-pointer hover:text-green-800"
                    >
                      Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {filteredRDs.length > rowsPerPage && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {selectedRDId && (
            <RDScheduleModal
              rdId={selectedRDId}
              onClose={() => setSelectedRDId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
