"use client";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="mx-auto bg-white/80 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* Hero Section with Background Image */}
        <div
          className="relative w-full h-[500px] flex items-center justify-center text-center"
          style={{
            backgroundImage: "url('/clgimg3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Text Content */}
          <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg px-4">
            Welcome to KPT Co-Operative Society - Mangalore
          </h1>
        </div>

        {/* About Section */}
        <div className="p-8 text-gray-700 leading-relaxed space-y-4">
          <p>
            The{" "}
            <strong>
              Karnataka Government Polytechnic (KPT) Cooperative Society
            </strong>{" "}
            was established in the year <strong>1958</strong>. As per records,
            the official registration date is <strong>29th August 1958</strong>.
            Since its inception, the society has been actively contributing to
            the financial welfare of its members.
          </p>

          <h2 className="text-2xl font-semibold text-indigo-700 mt-6 border-l-4 border-pink-400 pl-3">
            Objectives of the Association
          </h2>
          <ul className="list-disc pl-8 space-y-2">
            <li>
              To provide loans to members and depositors for beneficial and
              productive purposes.
            </li>
            <li>
              To promote a spirit of thrift, self-help, and cooperation among
              members.
            </li>
            <li>
              To collect capital through shares, member deposits, and loans.
            </li>
            <li>
              To supply educational materials (such as stationery) required by
              members and students.
            </li>
            <li>
              To implement student scholarships and other welfare programs as
              per the management rules.
            </li>
            <li>
              To raise and manage the necessary capital to fulfill the
              association’s objectives.
            </li>
            <li>
              To undertake other works aligned with the bylaws and goals of the
              society.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-indigo-700 mt-6 border-l-4 border-pink-400 pl-3">
            Working Capital / Fund Collection
          </h2>
          <p>
            The society manages its funds through share capital, member
            deposits, and loans. These resources are utilized to provide
            financial assistance and welfare benefits for the members and their
            families.
          </p>
        </div>
      </div>
    </div>
  );
}
