"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay";

export default function AdminRDForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    memberId: "",
    accountNumber: "", // ✅ added new field
    depositAmount: "",
    tenureMonths: "",
    interestRate: "",
    startDate: "",
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
        const sortedMembers = res.data.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );

        setMembers(sortedMembers);
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
        accountNumber: "",
        depositAmount: "",
        tenureMonths: "",
        interestRate: "",
        startDate: "",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-purple-200 p-8">
      <LoadOverlay show={loading} />

      <div className="bg-white/70 backdrop-blur-2xl shadow-2xl rounded-3xl p-10 w-full max-w-4xl mx-auto border border-white/40">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          🏦 Create New Recurring Deposit
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
        >
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-sm"
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Society Given RD Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Society Given RD Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="e.g., RD/2025/001"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-sm"
            />
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              step="0.1"
              value={formData.interestRate}
              onChange={handleChange}
              required
              placeholder="e.g., 7.5"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
            />
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tenure (Months)
            </label>
            <input
              type="number"
              name="tenureMonths"
              value={formData.tenureMonths}
              onChange={handleChange}
              required
              placeholder="e.g., 24"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
            />
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? "Creating..." : "✨ Create RD Account"}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-6 text-center font-semibold ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
