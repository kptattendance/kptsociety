"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay"; // ✅ Import overlay

export default function AdminFDForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    memberId: "",
    principal: "",
    interestRate: "",
    tenureYears: "",
    startDate: "",
    compoundingFrequency: "monthly",
    payoutFrequency: "maturity",
    autoRenew: false,
    preclosureAllowed: true,
    preclosurePenaltyPercent: "1.0",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Submit FD
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // show overlay
    setMessage("");

    try {
      const token = await getToken();

      // Convert tenureYears → tenureMonths
      const tenureMonths = Number(formData.tenureYears) * 12;

      const payload = {
        ...formData,
        tenureMonths,
        principal: Number(formData.principal),
        interestRate: Number(formData.interestRate),
        preclosurePenaltyPercent: Number(formData.preclosurePenaltyPercent),
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/fd`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ FD created successfully!");
      setFormData({
        memberId: "",
        principal: "",
        interestRate: "",
        tenureYears: "",
        startDate: "",
        compoundingFrequency: "monthly",
        payoutFrequency: "maturity",
        autoRenew: false,
        preclosureAllowed: true,
        preclosurePenaltyPercent: "1.0",
        notes: "",
      });
    } catch (error) {
      console.error("FD creation error:", error);
      setMessage("❌ Error creating FD");
    } finally {
      setLoading(false); // hide overlay
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-200 p-6">
      {/* ✅ Loader overlay */}
      <LoadOverlay show={loading} />

      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          🏦 Create New Fixed Deposit
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* ✅ Member Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Member
            </label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Deposit Amount (₹)
            </label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <option value="6.5">6.5%</option>
              <option value="7.0">7.0%</option>
              <option value="7.5">7.5%</option>
            </select>
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tenure (Years)
            </label>
            <select
              name="tenureYears"
              value={formData.tenureYears}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- Select Tenure --</option>
              {[1, 2, 3, 4, 5].map((yr) => (
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
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Compounding Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Compounding Frequency
            </label>
            <select
              name="compoundingFrequency"
              value={formData.compoundingFrequency}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          {/* Payout Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payout Frequency
            </label>
            <select
              name="payoutFrequency"
              value={formData.payoutFrequency}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="maturity">On Maturity</option>
            </select>
          </div>

          {/* Auto Renew & Preclosure */}
          <div className="flex gap-4 items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="autoRenew"
                checked={formData.autoRenew}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-700">Auto Renew</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="preclosureAllowed"
                checked={formData.preclosureAllowed}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-700">Allow Preclosure</span>
            </label>
          </div>

          {/* Preclosure Penalty */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preclosure Penalty (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="preclosurePenaltyPercent"
              value={formData.preclosurePenaltyPercent}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Any remarks or conditions..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Create FD"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
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
