"use client";

export default function Membership() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-8">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
          Membership
        </h1>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Eligibility:</strong> Membership is open to all staff of KPT
            College. Prospective members must submit proof of employment and
            identity.
          </p>
          <p>
            <strong>Registration Process:</strong> Interested staff members can
            apply by submitting the Membership Application Form through the
            portal or directly at the society office. Applications are reviewed
            and approved by the Admin.
          </p>
          <p>
            <strong>Benefits:</strong> Members gain access to deposits,
            recurring deposits, fixed deposits, loans, and other financial
            services offered by the society. They also receive timely
            notifications of society activities and announcements.
          </p>
        </div>
      </div>
    </div>
  );
}
