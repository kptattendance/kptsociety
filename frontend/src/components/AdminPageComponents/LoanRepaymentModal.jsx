"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { X } from "lucide-react";

export default function LoanRepaymentModal({ loanId, onClose }) {
  const { getToken } = useAuth();
  const [loan, setLoan] = useState(null);

  const fetchSchedule = async () => {
    const token = await getToken();
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${loanId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLoan(res.data);
  };

  const updateStatus = async (installmentNo, status) => {
    const token = await getToken();
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/loans/repay/${loanId}/${installmentNo}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchSchedule();
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  if (!loan) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-5xl overflow-auto max-h-[80vh] shadow-2xl relative">
        {/* Close button on top */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold mb-6 text-indigo-700 text-center">
          {loan.loanType} - Repayment Schedule
        </h3>

        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Due Date</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Interest</th>
                <th className="py-3 px-4 text-right">Total EMI</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loan.repayments.map((r, i) => (
                <tr
                  key={i}
                  className={`border-b transition-colors ${
                    r.status === "Paid"
                      ? "bg-green-50 hover:bg-green-100"
                      : "bg-yellow-50 hover:bg-yellow-100"
                  }`}
                >
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4">
                    {new Date(r.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ₹{r.principal.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ₹{r.interest.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ₹{r.totalEMI.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    ₹{r.scheduleOS.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(i + 1, e.target.value)}
                      className={`px-2 py-1 rounded-md border font-medium ${
                        r.status === "Paid"
                          ? "bg-green-200 text-green-800 border-green-400"
                          : "bg-yellow-200 text-yellow-800 border-yellow-400"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Close
          </button>
          <button
            onClick={() => alert("Changes saved successfully!")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
