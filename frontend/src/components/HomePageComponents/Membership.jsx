"use client";
import { useState } from "react";

export default function Membership() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [emi, setEmi] = useState(null);

  const calculateEMI = (e) => {
    e.preventDefault();
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100;
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

  const services = [
    {
      title: "Fixed Deposits (FD)",
      description: "Secure long-term deposits with fixed interest rates.",
    },
    {
      title: "Recurring Deposits (RD)",
      description: "Flexible monthly deposits for systematic savings.",
    },
    {
      title: "Loans",
      description:
        "Short-term and long-term loans for members, subject to approval.",
    },
    {
      title: "Shares & Member Deposits",
      description:
        "Collecting capital via shares and deposits to fund society goals.",
    },
  ];

  const downloads = [
    { name: "Membership Form", link: "/downloads/membership-form.pdf" },
    { name: "Loan Application Form", link: "/downloads/loan-form.pdf" },
    { name: "FD/RD Form", link: "/downloads/fd-policy.pdf" },
    { name: "By-Laws Cover Page 1958", link: "/bylaw.jpg" },
    { name: "Co-operative Society Objectives", link: "/2.pdf" },
    { name: "Consolidated Registration Form", link: "/1.pdf" },
  ];

  return (
    <div className="space-y-12 px-4 sm:px-6 py-8 max-w-7xl mx-auto">
      {/* Membership + Loan Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Membership Section */}
        <section className="bg-gradient-to-r from-green-100 via-teal-50 to-cyan-50 p-6 sm:p-8 rounded-3xl shadow-lg border border-green-200">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-green-800 text-center">
            Membership
          </h2>
          <div className="text-sm sm:text-base text-gray-800 space-y-2 leading-relaxed">
            <p>
              <strong>Eligibility:</strong> Open to all KPT staff with proof of
              employment.
            </p>
            <p>
              <strong>Registration:</strong> Submit Membership Form online or at
              the office; approved by Admin.
            </p>
            <p>
              <strong>Benefits:</strong> Access to deposits, RD/FD, loans, and
              notifications of society activities.
            </p>
          </div>
        </section>

        {/* Loan EMI Calculator */}
        <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 sm:p-8 rounded-3xl shadow-lg border border-blue-200">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-blue-700 text-center">
            Loan EMI Calculator
          </h2>
          <form onSubmit={calculateEMI} className="space-y-4">
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="Loan Amount (₹)"
              className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
            <input
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="Annual Interest Rate (%)"
              className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
            <input
              type="number"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              placeholder="Tenure (months)"
              className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring focus:ring-blue-200 outline-none"
            />
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-sm sm:text-base hover:opacity-90 transition">
              Calculate EMI
            </button>
          </form>
          {emi && (
            <p className="mt-4 text-center text-lg sm:text-xl font-semibold text-green-600">
              Monthly EMI: ₹{emi}
            </p>
          )}
        </section>
      </div>

      {/* Services */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-purple-700">
          Our Services
        </h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white shadow-md hover:shadow-lg p-5 sm:p-6 rounded-2xl border-l-4 border-pink-400 hover:scale-[1.02] transition-transform"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-pink-600 mb-2">
                {s.title}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Downloads Table */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-yellow-800">
          Downloads & Forms
        </h2>

        <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm sm:text-base">
            <thead className="bg-yellow-100">
              <tr>
                <th className="py-3 px-4 sm:px-6 text-left font-semibold text-gray-800">
                  Document
                </th>
                <th className="py-3 px-4 sm:px-6 text-left font-semibold text-gray-800">
                  Download
                </th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((d, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-yellow-50"}
                >
                  <td className="py-3 px-4 sm:px-6 text-gray-800 whitespace-nowrap">
                    {d.name}
                  </td>
                  <td className="py-3 px-4 sm:px-6">
                    <a
                      href={d.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gradient-to-r from-yellow-500 to-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg shadow hover:opacity-90 text-xs sm:text-sm"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
