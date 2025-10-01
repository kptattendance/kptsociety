"use client";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Address:</strong>
            KPT Cooperative Society Office, KPT Campus, [Your City], [State],
            [PIN]
          </p>
          <p>
            <strong>Email:</strong>
            <a href="mailto:society@kpt.edu" className="text-blue-600">
              society@kpt.edu
            </a>
          </p>
          <p>
            <strong>Phone:</strong> +91-9876543210
          </p>
          <p>
            <strong>Office Timings:</strong>
            Monday – Friday, 10:00 AM to 5:00 PM
          </p>
        </div>
      </div>
    </div>
  );
}
