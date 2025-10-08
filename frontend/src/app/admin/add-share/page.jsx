"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay";
import AdminShareBulkUpload from "./AdminShareBulkUpload";

export default function AdminShareForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    memberId: "",
  });

  const [totalPayable, setTotalPayable] = useState("");
  const [shares, setShares] = useState(0);
  const [fee, setFee] = useState(0);

  // ✅ Fetch all members
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

  // ✅ Handle generic form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "memberId") {
      const member = members.find((m) => m._id === value);
      setSelectedMember(member || null);
    }
  };

  // ✅ Calculate shares when total payable entered
  const handleAmountChange = (e) => {
    const enteredTotal = parseFloat(e.target.value) || 0;
    const calculatedShares = Math.floor(enteredTotal / 101); // since ₹1 fee/share
    const calculatedFee = calculatedShares * 1;

    setTotalPayable(enteredTotal);
    setShares(calculatedShares);
    setFee(calculatedFee);
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (shares <= 0) {
      setMessage("❌ Total payable must be at least ₹101.");
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const finalData = {
        ...formData,
        sharesBought: shares,
        sharePrice: 100,
        processingFee: fee,
        totalAmount: totalPayable,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share`,
        finalData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Share purchase added successfully!");
      setFormData({
        memberId: "",
      });
      setSelectedMember(null);
      setTotalPayable("");
      setShares(0);
      setFee(0);
    } catch (error) {
      console.error("Share creation error:", error);
      setMessage(error.response?.data?.error || "❌ Error adding share");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-indigo-100 to-teal-100 p-8">
      <LoadOverlay show={loading} />

      <AdminShareBulkUpload />

      <div className="bg-white/80 backdrop-blur-2xl shadow-2xl rounded-3xl p-10 w-full max-w-5xl mx-auto border border-white/50">
        <h1 className="text-2xl font-extrabold text-center bg-gradient-to-r from-pink-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent mb-10 drop-shadow-md">
          💠 Add Member Share Purchase
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
        >
          {/* Member Dropdown */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Member
            </label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl 
              focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Member Details Card */}
          {selectedMember && (
            <div className="sm:col-span-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-2">👤 Member Details</h3>
              <p>
                <strong>Name:</strong> {selectedMember.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedMember.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedMember.phone || "N/A"}
              </p>
              <p>
                <strong>Member ID:</strong> {selectedMember.memberId || "N/A"}
              </p>
            </div>
          )}

          {/* Total Payable Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Total Payable Amount (₹)
            </label>
            <input
              type="number"
              value={totalPayable}
              onChange={handleAmountChange}
              placeholder="Enter total amount paid"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 ₹100/share + ₹1 processing fee per share
            </p>
          </div>

          {/* Auto Calculated Fields */}
          <div>
            <label className="block text-sm text-gray-600">
              Number of Shares
            </label>
            <input
              type="text"
              value={shares}
              readOnly
              className="w-full bg-gray-100 border rounded-lg p-2 font-semibold text-indigo-700"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Processing Fee (₹)
            </label>
            <input
              type="text"
              value={fee}
              readOnly
              className="w-full bg-gray-100 border rounded-lg p-2"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500 
              text-white font-semibold py-3 px-8 rounded-xl hover:scale-105 transition-transform 
              duration-300 shadow-lg disabled:opacity-50"
            >
              {loading ? "Saving..." : "✨ Add Share Purchase"}
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
