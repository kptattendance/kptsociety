"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function AdminLoanApplicationForm() {
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    email: "",
    loanType: "",
    loanAmount: "",
    interestRate: "",
    tenure: "",
    loanPurpose: "",
    grossSalary: "",
    basicSalary: "",
    collateralType: "",
    collateralDetails: "",
    appliedAt: "",
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
        setMembers(res.data);
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
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/loans/create`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Loan application submitted successfully!");
      setForm({
        email: "",
        loanType: "",
        loanAmount: "",
        interestRate: "",
        tenure: "",
        loanPurpose: "",
        collateralType: "",
        collateralDetails: "",
        grossSalary: "",
        basicSalary: "",
        appliedAt: "",
      });
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error submitting loan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        📝 Admin Loan Application
      </h2>
      {message && (
        <p
          className={`text-center mb-4 ${
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
            <option value="Personal">Personal</option>
            <option value="Education">Education</option>
            <option value="Home">Home</option>
            <option value="Vehicle">Vehicle</option>
            <option value="RD-based">RD-based</option>
            <option value="FD-based">FD-based</option>
          </select>
        </div>
        {/* Loan Amount */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Loan Amount</label>
          <input
            type="number"
            name="loanAmount"
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
            onChange={handleChange}
            placeholder="Enter interest rate"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>
        {/* Tenure */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Tenure (months)
          </label>
          <select
            name="tenure"
            value={form.tenure}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value="">-- Select Tenure --</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
            <option value="18">18 Months</option>
            <option value="24">24 Months</option>
            <option value="36">36 Months</option>
            <option value="48">48 Months</option>
            <option value="60">60 Months</option>
            <option value="72">72 Months</option>
            <option value="84">84 Months</option>
            <option value="96">96 Months</option>
            <option value="108">108 Months</option>
            <option value="120">120 Months</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Applied Date</label>
          <input
            type="date"
            name="appliedAt"
            value={form.appliedAt || ""}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          <select
            name="collateralType"
            value={form.collateralType}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">-- Select Collateral --</option>
            <option value="Suirity">Suirity</option>
            <option value="FD">FD</option>
            <option value="Property">Property</option>
            <option value="Gold">Gold</option>
            <option value="None">None</option>
          </select>
        </div>
        {/* Collateral Details */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Collateral Details
          </label>
          <input
            type="text"
            name="collateralDetails"
            value={form.collateralDetails}
            onChange={handleChange}
            placeholder="Enter Suirity Person Name"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Basic Salary</label>
          <input
            type="number"
            name="basicSalary"
            value={form.basicSalary}
            onChange={handleChange}
            placeholder="Enter basic salary amount"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Gross Salary</label>
          <input
            type="number"
            name="grossSalary"
            value={form.grossSalary}
            onChange={handleChange}
            placeholder="Enter gross salary amount"
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>
        {/* Submit Button */}
        <div className="md:col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Loan"}
          </button>
        </div>
      </form>
    </div>
  );
}
