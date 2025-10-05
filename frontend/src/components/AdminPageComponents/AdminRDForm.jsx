"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function AdminRDForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    memberId: "",
    depositAmount: "",
    tenureMonths: "",
    interestRate: "",
    startDate: "",
    dueDayOfMonth: 1,
    gracePeriodDays: 7,
    lateFeePerInstallment: 0,
    notes: "",
  });

  // ✅ Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMembers(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [getToken]);

  // ✅ Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = await getToken();
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/rd`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ RD account created successfully!");
      setFormData({
        memberId: "",
        depositAmount: "",
        tenureMonths: "",
        interestRate: "",
        startDate: "",
        dueDayOfMonth: 1,
        gracePeriodDays: 7,
        lateFeePerInstallment: 0,
        notes: "",
      });
    } catch (error) {
      console.error("RD creation error:", error);
      setMessage("❌ Error creating RD account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-green-100 to-teal-200 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-teal-700 mb-6">
          🏦 Create New Recurring Deposit
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Member
            </label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Deposit Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monthly Deposit Amount (₹)
            </label>
            <input
              type="number"
              name="depositAmount"
              value={formData.depositAmount}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interest Rate (%)
            </label>
            <select
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Select Rate --</option>
              <option value="6.0">6.0%</option>
              <option value="6.5">6.5%</option>
              <option value="7.0">7.0%</option>
            </select>
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tenure (Months)
            </label>
            <select
              name="tenureMonths"
              value={formData.tenureMonths}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Select Tenure --</option>
              {[12, 24, 36, 48, 60].map((yr) => (
                <option key={yr} value={yr}>
                  {yr} Year{yr > 1 && "s"}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Due Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Day of Month
            </label>
            <input
              type="number"
              name="dueDayOfMonth"
              min="1"
              max="28"
              value={formData.dueDayOfMonth}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Grace Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grace Period (Days)
            </label>
            <input
              type="number"
              name="gracePeriodDays"
              value={formData.gracePeriodDays}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Late Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Late Fee per Installment (₹)
            </label>
            <input
              type="number"
              name="lateFeePerInstallment"
              value={formData.lateFeePerInstallment}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-xl focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-xl hover:bg-teal-700 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create RD Account"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
