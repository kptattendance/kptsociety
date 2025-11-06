"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay";

export default function AdminCDForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    memberId: "",
    startDate: "",
    monthlyDeposit: "",
    accountNumber: "",
    initialDeposit: "",
    initialDepositDate: "",
  });

  // Fetch all members
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit deposit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = await getToken();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cd`,
        {
          accountNumber: formData.accountNumber,
          memberId: formData.memberId,
          monthlyDeposit: Number(formData.monthlyDeposit),
          startDate: formData.startDate,
          initialDeposit: Number(formData.initialDeposit),
          initialDepositDate: formData.initialDepositDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ CD Deposit successfully created!");
      setFormData({
        memberId: "",
        startDate: "",
        monthlyDeposit: "",
        accountNumber: "",
        initialDeposit: "",
        initialDepositDate: "",
      });
    } catch (error) {
      console.error("Error processing CD deposit:", error);
      setMessage("❌ Error processing CD deposit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-purple-100 to-pink-100 p-8">
      <LoadOverlay show={loading} />
      <div className="bg-white/70 backdrop-blur-2xl shadow-2xl rounded-3xl p-10 w-full max-w-5xl mx-auto border border-white/40">
        <h1 className="text-2xl font-bold text-red-700 mb-6 text-center">
          💰 Compulsory Deposit (CD) Entry
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
        >
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
          {/* Society CD Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Society CD Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="Enter society CD number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
            />
          </div>
          {/* Initial Deposit Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Initial Deposit Amount (₹)
            </label>
            <input
              type="number"
              name="initialDeposit"
              value={formData.initialDeposit}
              onChange={handleChange}
              min="0"
              step="1"
              required
              onWheel={(e) => e.target.blur()}
              placeholder="Enter initial deposit amount"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
            />
          </div>

          {/* Initial Deposit Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Opening Date
            </label>
            <input
              type="date"
              name="initialDepositDate"
              value={formData.initialDepositDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
            />
          </div>

          {/* Monthly Deposit (user input) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monthly Deposit (₹)
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="monthlyDeposit"
              value={formData.monthlyDeposit}
              onChange={handleChange}
              min="100"
              step="100"
              required
              placeholder="Enter monthly deposit amount"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
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
          {/* Submit Button */}
          <div className="sm:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? "Processing..." : "💳 Submit CD Deposit"}
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
