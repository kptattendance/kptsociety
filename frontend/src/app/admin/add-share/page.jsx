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
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    memberId: "",
    shareNumber: "",
    purchaseDate: "",
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "memberId") {
      const member = members.find((m) => m._id === value);
      setSelectedMember(member || null);
    }
  };

  // ✅ Auto-calculate shares and fees
  const handleAmountChange = (e) => {
    const enteredTotal = parseFloat(e.target.value) || 0;
    const calculatedShares = Math.floor(enteredTotal / 101); // ₹100/share + ₹1 fee/share
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

    if (!formData.memberId) {
      setMessage("❌ Please select a member.");
      setLoading(false);
      return;
    }

    if (!formData.shareNumber) {
      setMessage("❌ Please enter the society-assigned share number.");
      setLoading(false);
      return;
    }

    if (!formData.purchaseDate) {
      setMessage("❌ Please select the purchase date.");
      setLoading(false);
      return;
    }

    if (shares <= 0) {
      setMessage("❌ Total payable must be at least ₹101 (1 share).");
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();

      const payload = {
        memberId: formData.memberId,
        societyShareNumber: formData.shareNumber,
        purchaseDate: formData.purchaseDate,
        sharesBought: shares,
        sharePrice: 100,
        processingFee: fee,
        totalAmount: totalPayable,
        paymentMode: "Cash",
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/share`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ Share purchase recorded successfully!");
      setFormData({ memberId: "", shareNumber: "", purchaseDate: "" });
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

      <div className="bg-white/80 backdrop-blur-2xl shadow-2xl rounded-3xl p-10 w-full max-w-5xl mx-auto border border-white/50">
        <h1 className="text-2xl font-extrabold text-center bg-gradient-to-r from-pink-600 via-indigo-600 to-teal-600 bg-clip-text text-transparent mb-10 drop-shadow-md">
          💠 Add Member Share Purchase
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
        >
          {/* Member Search */}
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
                setFormData((prev) => ({ ...prev, memberId: "" }));
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Type member name or email..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 shadow-sm"
            />

            {showDropdown && searchTerm && (
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
                        setSearchTerm("");
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

          {/* Share Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Society Given Share Number
            </label>
            <input
              type="text"
              name="shareNumber"
              value={formData.shareNumber}
              onChange={handleChange}
              placeholder="Enter society-assigned share number"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
          </div>

          {/* Total Payable */}
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

          {/* Calculated Fields */}
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

          {/* Submit */}
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
