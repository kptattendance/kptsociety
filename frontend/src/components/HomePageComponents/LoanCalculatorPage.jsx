"use client";
import { useState } from "react";

export default function LoanCalculatorPage() {
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [tenure, setTenure] = useState("");
  const [emi, setEmi] = useState(null);

  const calculateEMI = (e) => {
    e.preventDefault();
    const principal = parseFloat(amount);
    const rate = parseFloat(interest) / 12 / 100; // monthly interest rate
    const months = parseInt(tenure);

    if (!principal || !rate || !months) {
      setEmi("Please enter valid values.");
      return;
    }

    const emiValue =
      (principal * rate * Math.pow(1 + rate, months)) /
      (Math.pow(1 + rate, months) - 1);

    setEmi(emiValue.toFixed(2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loan EMI Calculator
        </h1>

        <form onSubmit={calculateEMI} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Loan Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter loan amount"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g., 12"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tenure (in months)
            </label>
            <input
              type="number"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              placeholder="e.g., 24"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
          >
            Calculate EMI
          </button>
        </form>

        {emi && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Monthly EMI: <span className="text-green-600">₹{emi}</span>
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
