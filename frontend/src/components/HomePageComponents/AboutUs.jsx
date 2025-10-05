"use client";

export default function AboutUs() {
  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
          About Us
        </h1>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>History:</strong> KPT Cooperative Society was established in
            [Year] to provide financial support and savings facilities to the
            staff of KPT College. Over the years, it has grown to support
            hundreds of members.
          </p>
          <p>
            <strong>Objectives:</strong> The society aims to promote financial
            stability among staff members by offering loans, deposits, and
            savings schemes. It also fosters a sense of community and mutual
            support.
          </p>
          <p>
            <strong>Role:</strong> The society manages various financial
            products, ensures timely processing of deposits and loans, and
            provides a secure portal for members to access account details
            online.
          </p>
        </div>
      </div>
    </div>
  );
}
