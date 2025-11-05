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
      description:
        "Secure long-term deposits with fixed interest rates. Members can choose the tenure according to their convenience.",
    },
    {
      title: "Recurring Deposits (RD)",
      description:
        "Flexible monthly deposits for members who wish to save systematically. Interest rates are competitive and compound monthly.",
    },
    {
      title: "Loans",
      description:
        "Short-term and long-term loans for members, subject to approval by Admin. Includes staff loans, emergency loans, and personal loans.",
    },
    {
      title: "Other Services",
      description:
        "Financial advisory support, account statements, and notifications for members. Additional schemes may be introduced periodically.",
    },
  ];

  const downloads = [
    {
      name: "Membership Application Form",
      link: "/downloads/membership-form.pdf",
    },
    {
      name: "Loan Application Form (Long Term / Short Term)",
      link: "/downloads/loan-form.pdf",
    },
    {
      name: "Fixed Deposit / RD Application Form",
      link: "/downloads/fd-policy.pdf",
    },
    {
      name: "By-Laws Cover Page 1958",
      link: "/bylaw.jpg",
    },
    {
      name: "Co-operative Society Objectives",
      link: "/2.pdf",
    },
    {
      name: "Consolidated Registration Form",
      link: "/1.pdf",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Membership Section */}
      <section className="bg-gradient-to-r from-green-100 via-teal-50 to-cyan-50 p-10">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-green-200">
          <h1 className="text-3xl font-bold text-center mb-6 text-green-800">
            Membership
          </h1>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Eligibility:</strong> Membership is open to all staff of
              KPT College. Prospective members must submit proof of employment
              and identity.
            </p>
            <p>
              <strong>Registration Process:</strong> Interested staff members
              can apply by submitting the Membership Application Form through
              the portal or directly at the society office. Applications are
              reviewed and approved by the Admin.
            </p>
            <p>
              <strong>Benefits:</strong> Members gain access to deposits,
              recurring deposits, fixed deposits, loans, and other financial
              services offered by the society. They also receive timely
              notifications of society activities and announcements.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 p-10">
        <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-pink-400 hover:scale-105 transition-transform"
            >
              <h2 className="text-xl font-semibold text-pink-600 mb-2">
                {service.title}
              </h2>
              <p className="text-gray-700">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Loan Calculator Section */}
      <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-10">
        <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl p-8 border border-blue-200">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
            Loan EMI Calculator
          </h1>

          <form onSubmit={calculateEMI} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
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
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
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
      </section>

      {/* Downloads Section */}
      <section className="bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 p-10">
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8 border border-yellow-200">
          <h1 className="text-3xl font-bold text-center mb-6 text-yellow-800">
            Downloads & Forms
          </h1>
          <ul className="space-y-4">
            {downloads.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-yellow-50 transition"
              >
                <span className="text-gray-800 font-medium">{file.name}</span>
                <a
                  href={file.link}
                  target="_blank"
                  className="text-white bg-gradient-to-r from-yellow-500 to-pink-500 px-4 py-2 rounded-lg shadow hover:opacity-90"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
