"use client";
import { useState } from "react";
import {
  BadgeCheck,
  ClipboardList,
  Gift,
  Calculator,
  Landmark,
  CalendarSync,
  HandCoins,
  PieChart,
  FileText,
  Download,
} from "lucide-react";

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

  const membershipInfo = [
    {
      icon: BadgeCheck,
      title: "Eligibility",
      text: "Open to all KPT staff with proof of employment.",
    },
    {
      icon: ClipboardList,
      title: "Registration",
      text: "Submit Membership Form online or at the office; approved by Admin.",
    },
    {
      icon: Gift,
      title: "Benefits",
      text: "Access to deposits, RD/FD, loans, and notifications of society activities.",
    },
  ];

  const services = [
    {
      icon: Landmark,
      title: "Fixed Deposits (FD)",
      description: "Secure long-term deposits with fixed interest rates.",
      tint: "from-purple-200 to-purple-100 text-purple-800",
    },
    {
      icon: CalendarSync,
      title: "Recurring Deposits (RD)",
      description: "Flexible monthly deposits for systematic savings.",
      tint: "from-pink-200 to-pink-100 text-pink-800",
    },
    {
      icon: HandCoins,
      title: "Loans",
      description:
        "Short-term and long-term loans for members, subject to approval.",
      tint: "from-blue-200 to-blue-100 text-blue-800",
    },
    {
      icon: PieChart,
      title: "Shares & Member Deposits",
      description:
        "Collecting capital via shares and deposits to fund society goals.",
      tint: "from-pink-300 to-pink-100 text-pink-800",
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

  const isValidEmi = emi && !isNaN(Number(emi));

  return (
    <div className="space-y-16 sm:space-y-24 px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
      {/* Membership + Loan Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Membership Section */}
        <section className="rounded-[28px] bg-gradient-to-br from-purple-100 via-pink-50 to-white p-6 sm:p-10 ring-1 ring-purple-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
            Join us
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Membership
          </h2>
          <div className="mt-6 space-y-4">
            {membershipInfo.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl bg-white/80 p-4 ring-1 ring-white shadow-soft"
              >
                <span className="grid place-items-center shrink-0 w-11 h-11 rounded-xl bg-purple-200/70 text-purple-800">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loan EMI Calculator */}
        <section className="rounded-[28px] bg-white p-6 sm:p-10 shadow-soft ring-1 ring-blue-100 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-blue-200/50 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-blue-200/70 text-blue-800">
                <Calculator className="w-5 h-5" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Loan EMI Calculator
              </h2>
            </div>
            <form onSubmit={calculateEMI} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-600">
                  Loan Amount (₹)
                </span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="e.g. 200000"
                  className="mt-1 w-full px-4 py-3 text-sm sm:text-base border rounded-xl bg-gray-50"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-600">
                    Interest (% p.a.)
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="e.g. 9.5"
                    className="mt-1 w-full px-4 py-3 text-sm sm:text-base border rounded-xl bg-gray-50"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-600">
                    Tenure (months)
                  </span>
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder="e.g. 36"
                    className="mt-1 w-full px-4 py-3 text-sm sm:text-base border rounded-xl bg-gray-50"
                  />
                </label>
              </div>
              <button className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-purple-700 transition-colors">
                Calculate EMI
              </button>
            </form>
            {emi && (
              <div
                className={`mt-5 rounded-2xl p-4 text-center ${
                  isValidEmi
                    ? "bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {isValidEmi ? (
                  <>
                    <p className="text-sm text-gray-600">Monthly EMI</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      ₹{emi}
                    </p>
                  </>
                ) : (
                  <p className="font-medium">{emi}</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Services */}
      <section id="services" className="scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
            What we offer
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900">
            Our Services
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description, tint }) => (
            <div
              key={title}
              className="group rounded-3xl bg-white p-6 shadow-soft ring-1 ring-gray-100 hover:-translate-y-1 hover:ring-purple-200 transition-all duration-300"
            >
              <span
                className={`grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br ${tint}`}
              >
                <Icon className="w-6 h-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Downloads */}
      <section>
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Resources
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900">
            Downloads & Forms
          </h2>
        </div>

        <div className="mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {downloads.map((d) => (
            <a
              key={d.name}
              href={d.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-gray-100 hover:ring-pink-200 transition"
            >
              <span className="grid place-items-center shrink-0 w-11 h-11 rounded-xl bg-pink-100 text-pink-700">
                <FileText className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0 text-sm sm:text-base font-medium text-gray-800">
                {d.name}
              </span>
              <span className="grid place-items-center shrink-0 w-9 h-9 rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                <Download className="w-4 h-4" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
