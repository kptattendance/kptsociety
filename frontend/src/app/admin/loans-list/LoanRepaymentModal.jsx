"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadOverlay from "../../../components/LoadOverlay";

export default function LoanRepaymentModal({ loanId, onClose }) {
  const { getToken } = useAuth();
  const [loan, setLoan] = useState(null);
  const [prepayAmount, setPrepayAmount] = useState("");
  const [prepayMode, setPrepayMode] = useState("reduceTenure");
  const [installmentNo, setInstallmentNo] = useState(null);
  const [loading, setLoading] = useState(false); // overlay state
  const [editingDateIndex, setEditingDateIndex] = useState(null);
  const [editDate, setEditDate] = useState("");

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${loanId}/repay`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLoan(res.data);
    } catch (err) {
      toast.error("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (installmentNo, status) => {
    try {
      setLoading(true);
      const token = await getToken();

      // find current repayment record
      const repayment = loan.repayments[installmentNo - 1];
      const updatedDate = repayment.tempDueDate || repayment.dueDate; // use edited one if exists

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/repay/${loanId}/${installmentNo}`,
        {
          status,
          dueDate: updatedDate, // send date when marking paid
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(`Installment #${installmentNo} marked as ${status}`);
      fetchSchedule();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handlePrepay = async () => {
    if (!prepayAmount || !installmentNo) {
      toast.warning("Enter amount and select installment");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/prepay/${loanId}`,
        {
          amount: Number(prepayAmount),
          mode: prepayMode,
          installment: installmentNo,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log(res);
      toast.success("Prepayment applied successfully");
      setPrepayAmount("");
      setInstallmentNo(null);
      fetchSchedule();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply prepayment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  if (!loan) return <div>Loading...</div>;

  return (
    <>
      <LoadOverlay show={loading} />

      <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-5xl overflow-auto max-h-[85vh] shadow-xl relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 cursor-pointer text-gray-600 hover:text-red-500"
          >
            <X size={22} />
          </button>

          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            {loan.loanType} - Repayment Schedule
          </h3>

          <table className="min-w-full border rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Due Date</th>
                <th className="p-2">Principal</th>
                <th className="p-2">Interest</th>
                <th className="p-2">Total EMI</th>
                <th className="p-2">Outstanding</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {loan.repayments.map((r, i) => (
                <tr
                  key={i}
                  className={`border-b text-center ${
                    r.status === "Paid" ? "bg-green-100" : ""
                  }`}
                >
                  <td className="p-2">{i + 1}</td>

                  {/* 🗓️ Editable Due Date */}
                  <td
                    className="p-2 cursor-pointer"
                    onClick={() => setEditingDateIndex(i)}
                  >
                    {editingDateIndex === i ? (
                      <input
                        type="date"
                        value={
                          editDate ||
                          new Date(r.tempDueDate || r.dueDate)
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setEditDate(newVal);
                          const updated = [...loan.repayments];
                          updated[i].tempDueDate = newVal; // store locally only
                          setLoan({ ...loan, repayments: updated });
                        }}
                        onBlur={() => setEditingDateIndex(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") {
                            setEditingDateIndex(null);
                          }
                        }}
                        className="border px-2 py-1 rounded w-[130px] text-center"
                        autoFocus
                      />
                    ) : (
                      <span className="hover:underline text-blue-700">
                        {new Date(
                          r.tempDueDate || r.dueDate,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                        {r.tempDueDate && (
                          <span className="ml-1 text-xs text-orange-500">
                            (unsaved)
                          </span>
                        )}
                      </span>
                    )}
                  </td>

                  <td className="p-2">
                    ₹
                    {r.principal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2">
                    ₹
                    {r.interest.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2 font-semibold">
                    ₹
                    {r.totalEMI.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2 font-semibold text-blue-600">
                    ₹
                    {r.scheduleOS.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(i + 1, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 💰 Lump-sum Payment Section */}
          <div className="mt-6 p-4 border border-amber-300 rounded-lg bg-red-50">
            <h4 className="text-lg font-semibold mb-3 text-green-700">
              Lump-Sum Payment
            </h4>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="number"
                placeholder="Enter amount"
                value={prepayAmount}
                onChange={(e) => setPrepayAmount(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="border border-amber-500  px-3 py-2 rounded flex-1"
              />
              <select
                value={installmentNo || ""}
                onChange={(e) => setInstallmentNo(Number(e.target.value))}
                className="border  border-amber-500 px-3 py-2 rounded"
              >
                <option value="">Select Last Installment U Paid</option>
                {loan.repayments.map((r, i) => (
                  <option key={i} value={i + 1}>
                    Installment {i + 1} (
                    {new Date(r.dueDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <select
                value={prepayMode}
                onChange={(e) => setPrepayMode(e.target.value)}
                className="border  border-amber-500 px-3 py-2 rounded"
              >
                <option value="reduceTenure">Reduce Tenure</option>
                <option value="reduceEMI">Reduce EMI</option>
              </select>
              <button
                onClick={handlePrepay}
                className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Apply
              </button>
            </div>
          </div>

          {/* 📜 Lump-Sum Payment History */}
          {loan.lumpSumPayments && loan.lumpSumPayments.length > 0 && (
            <div className="mt-6 p-4  rounded-lg bg-gray-200">
              <h4 className="text-lg font-semibold mb-3 text-green-700">
                Lump-Sum Payment History
              </h4>
              <table className="min-w-full border rounded-lg overflow-hidden shadow">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Installment</th>
                    <th className="p-2">Mode</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.lumpSumPayments.map((p, i) => (
                    <tr key={i} className="border-b text-center">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-semibold text-blue-600">
                        ₹
                        {p.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2">#{p.installment}</td>
                      <td className="p-2">
                        {p.mode === "reduceTenure"
                          ? "Reduce Tenure"
                          : "Reduce EMI"}
                      </td>
                      <td className="p-2">
                        {new Date(p.paidAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ✅ Save & Close */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
