"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function RDScheduleModal({ rdId, onClose }) {
  const { getToken } = useAuth();
  const [rd, setRD] = useState(null);

  const fetchRD = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/${rdId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRD(res.data);
    } catch (err) {
      toast.error("Failed to fetch RD");
    }
  };

  const updateStatus = async (installmentNo, status) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rd/installment/${rdId}/${installmentNo}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Installment #${installmentNo} marked as ${status}`);
      fetchRD();
    } catch (err) {
      toast.error("Failed to update installment");
    }
  };

  useEffect(() => {
    if (rdId) fetchRD();
  }, [rdId]);

  if (!rd) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-teal-700 mb-4">
          📅 RD Installment Schedule – {rd.accountNumber}
        </h2>

        <div className="overflow-x-auto max-h-[400px] overflow-y-scroll">
          <table className="min-w-full border text-sm">
            <thead className="bg-teal-100 text-gray-700">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Due Date</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {rd.installments.map((inst, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 text-center">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">
                    {new Date(inst.dueDate).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-3 py-2">₹{inst.amount}</td>
                  <td className="px-3 py-2">
                    <select
                      value={inst.status}
                      onChange={(e) => updateStatus(idx + 1, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {inst.paidAt
                      ? new Date(inst.paidAt).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
