"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import LoadOverlay from "../../../components/LoadOverlay";
import { toast } from "react-toastify";

export default function AdminLoanApplicationForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);

  const today = new Date().toISOString().split("T")[0]; // today's date in YYYY-MM-DD

  const [form, setForm] = useState({
    email: "",
    loanAccountNumber: "",
    loanType: "",
    loanAmount: "",
    interestRate: "",
    tenure: "",
    loanPurpose: "",
    grossSalary: "",
    basicSalary: "",
    collateralType: "Suirity",
    collateralDetails: "",
    appliedAt: "", // default to today's date
    startDate: "", // new field: start date input manually
    chequeNumber: "",
    chequeDate: "",
    chequeAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch members for dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = await getToken();

      if (form.loanAmount <= 0 || form.interestRate <= 0 || form.tenure <= 0) {
        toast.error(
          "Please enter valid positive numbers for amount, interest, and tenure."
        );
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/create`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Loan application submitted successfully!");
      toast.success(" Loan application submitted successfully!");

      setForm({
        email: "",
        loanAccountNumber: "",
        loanType: "",
        loanAmount: "",
        interestRate: "",
        tenure: "",
        loanPurpose: "",
        grossSalary: "",
        basicSalary: "",
        collateralType: "Suirity",
        collateralDetails: "",
        appliedAt: "",
        startDate: "",
        chequeNumber: "",
        chequeDate: "",
        chequeAmount: "",
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Error submitting loan");
      toast.error(err.response?.data?.message || "❌ Error submitting loan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-100">
      <LoadOverlay show={loading} />

      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
        🏦 Admin Loan Application Form
      </h2>

      {message && (
        <p
          className={`text-center mb-4 font-medium ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={handleSubmit}
      >
        {/* Member Selection */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Select Member
          </label>
          <select
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value="">-- Select Member --</option>
            {members.map((m) => (
              <option key={m._id} value={m.email}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </div>

        {/* Loan Account Number */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Loan Account Number
          </label>
          <input
            type="text"
            name="loanAccountNumber"
            value={form.loanAccountNumber}
            onChange={handleChange}
            placeholder="Enter society loan number"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Loan Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Loan Type</label>
          <select
            name="loanType"
            value={form.loanType}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value="">-- Select Loan Type --</option>
            <option value="Long Term">Long Term</option>
            <option value="Short Term">Short Term</option>
          </select>
        </div>

        {/* Loan Amount */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Loan Amount</label>
          <input
            type="number"
            name="loanAmount"
            onWheel={(e) => e.target.blur()}
            value={form.loanAmount}
            onChange={handleChange}
            placeholder="Enter loan amount"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Interest Rate */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Interest Rate (%)
          </label>
          <input
            type="number"
            name="interestRate"
            value={form.interestRate}
            onWheel={(e) => e.target.blur()}
            onChange={handleChange}
            placeholder="Enter interest rate"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Tenure */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Tenure (in months)
          </label>
          <input
            type="number"
            onWheel={(e) => e.target.blur()}
            name="tenure"
            value={form.tenure}
            onChange={handleChange}
            placeholder="Enter tenure manually"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Applied Date (auto default to today) */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Applied Date</label>
          <input
            type="date"
            name="appliedAt"
            value={form.appliedAt}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2 bg-gray-100 text-gray-700"
          />
        </div>

        {/* Start Date (manual input) */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Loan Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Loan Purpose */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">Loan Purpose</label>
          <textarea
            name="loanPurpose"
            value={form.loanPurpose}
            onChange={handleChange}
            placeholder="Enter purpose of loan"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={3}
            required
          />
        </div>

        {/* Collateral Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Collateral Type
          </label>
          <input
            type="text"
            name="collateralType"
            value="Suirity"
            readOnly
            className="border rounded px-3 py-2 bg-gray-100 text-gray-700"
          />
        </div>

        {/* Collateral Details */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Suirity Person Name
          </label>
          <input
            type="text"
            name="collateralDetails"
            value={form.collateralDetails}
            onChange={handleChange}
            placeholder="Enter Suirity Person Name"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Basic & Gross Salary */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Basic Salary</label>
          <input
            type="number"
            onWheel={(e) => e.target.blur()}
            name="basicSalary"
            value={form.basicSalary}
            onChange={handleChange}
            placeholder="Enter basic salary"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Gross Salary</label>
          <input
            type="number"
            onWheel={(e) => e.target.blur()}
            name="grossSalary"
            value={form.grossSalary}
            onChange={handleChange}
            placeholder="Enter gross salary"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Cheque Details Section */}
        <div className="md:col-span-2 mt-4 border-t border-gray-300 pt-4">
          <h3 className="text-lg font-semibold mb-2 text-indigo-700">
            🧾 Cheque Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Cheque Number
              </label>
              <input
                type="text"
                name="chequeNumber"
                value={form.chequeNumber}
                onChange={handleChange}
                placeholder="Enter cheque number"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Cheque Date
              </label>
              <input
                type="date"
                name="chequeDate"
                value={form.chequeDate}
                onChange={handleChange}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">
                Cheque Amount
              </label>
              <input
                type="text"
                name="chequeAmount"
                value={form.chequeAmount}
                onChange={handleChange}
                placeholder="Enter cheque Amount"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold px-8 py-2 rounded-lg shadow-md transition-all"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Loan"}
          </button>
        </div>
      </form>
    </div>
  );
}
