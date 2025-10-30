"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay";

export default function AdminFDForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    fdNumber: "", // ✅ added
    memberId: "",
    principal: "",
    interestRate: "",
    tenureMonths: "",
    startDate: "",
    nominee: "",
    autoRenew: false,
    preclosureAllowed: true,
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

  // ✅ Handle input changes
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
    setLoading(true);
    setMessage("");

    try {
      const token = await getToken();

      const payload = {
        ...formData,
        tenureMonths: Number(formData.tenureMonths),
        principal: Number(formData.principal),
        interestRate: Number(formData.interestRate),
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/fd`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ FD created successfully!");

      setFormData({
        fdNumber: "",
        memberId: "",
        principal: "",
        interestRate: "",
        tenureMonths: "",
        startDate: "",
        nominee: "",
        autoRenew: false,
        preclosureAllowed: true,
        notes: "",
      });
    } catch (error) {
      console.error("FD creation error:", error);
      setMessage(
        error.response?.data?.error || "❌ Error creating FD. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-200 p-6">
      <LoadOverlay show={loading} />

      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-8">
          🏦 Create New Fixed Deposit
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* ✅ Society FD Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Society FD Number
            </label>
            <input
              type="text"
              name="fdNumber"
              value={formData.fdNumber}
              onChange={handleChange}
              required
              placeholder="e.g., KPTCS/FD/172"
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Member */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Select Member
            </label>

            <input
              type="text"
              value={
                searchTerm ||
                (formData.memberId
                  ? `${
                      members.find((m) => m._id === formData.memberId)?.name
                    } (${
                      members.find((m) => m._id === formData.memberId)?.email
                    })`
                  : "")
              }
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setFormData((prev) => ({ ...prev, memberId: "" })); // clear selected member
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Type member name or email..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-sm"
            />

            {searchTerm && (
              <ul className="absolute z-10 bg-white border border-gray-300 w-full rounded-xl mt-1 max-h-48 overflow-y-auto shadow-lg">
                {members
                  .filter(
                    (m) =>
                      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      m.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((m) => (
                    <li
                      key={m._id}
                      onMouseDown={() => {
                        setFormData((prev) => ({ ...prev, memberId: m._id }));
                        setSearchTerm(""); // clear typing
                      }}
                      className="px-3 py-2 hover:bg-purple-100 cursor-pointer transition"
                    >
                      {m.name} ({m.email})
                    </li>
                  ))}

                {members.filter(
                  (m) =>
                    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <li className="px-3 py-2 text-gray-500">
                    No matching members
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Deposit Amount */}
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
              onWheel={(e) => e.target.blur()}
              placeholder="Enter amount"
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              required
              onWheel={(e) => e.target.blur()}
              placeholder="e.g., 7.5"
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* ✅ Tenure in Months */}
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
              onWheel={(e) => e.target.blur()}
              placeholder="e.g., 12 for 1 year"
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nominee
            </label>
            <input
              type="text"
              name="nominee"
              value={formData.nominee}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Any remarks or conditions..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 sm:col-span-2"
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
