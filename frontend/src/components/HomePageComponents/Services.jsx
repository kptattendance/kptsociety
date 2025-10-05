"use client";

export default function Services() {
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

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Our Services
        </h1>
        <div className="space-y-4 text-gray-700">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-pink-400 mb-1">
                {service.title}
              </h2>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
