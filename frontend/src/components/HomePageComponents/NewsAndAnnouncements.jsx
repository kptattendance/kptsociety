"use client";

export default function NewsAndAnnouncements() {
  const news = [
    {
      date: "September 20, 2025",
      title: "Quarterly Loan Repayment Notice",
      description:
        "Members are reminded that the September quarter loan repayment is due by 30th September 2025. Please ensure timely payments.",
    },
    {
      date: "August 15, 2025",
      title: "Independence Day Celebration",
      description:
        "The society celebrated Independence Day with a flag hoisting ceremony and cultural programs at the college campus.",
    },
    {
      date: "July 5, 2025",
      title: "New Recurring Deposit Scheme",
      description:
        "A new RD scheme has been introduced with flexible monthly deposits starting from ₹500. Members can enroll from this month onwards.",
    },
    {
      date: "June 10, 2025",
      title: "Annual General Meeting (AGM)",
      description:
        "The AGM for the financial year 2024–25 was held on June 10th at the KPT auditorium. Key decisions and resolutions were passed.",
    },
    {
      date: "May 1, 2025",
      title: "Labour Day Holiday",
      description:
        "The society office remained closed on May 1st for Labour Day. Regular working resumed from May 2nd.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          News & Announcements
        </h1>
        <ul className="space-y-6">
          {news.map((item, index) => (
            <li
              key={index}
              className="border-l-4 border-indigo-500 pl-4 hover:bg-gray-50 rounded-md transition"
            >
              <p className="text-sm text-gray-500">{item.date}</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h2>
              <p className="text-gray-600">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
