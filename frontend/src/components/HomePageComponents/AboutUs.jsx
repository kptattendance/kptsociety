"use client";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-sans">
      <div className="mx-auto bg-white/90 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* Hero Section */}
        <div
          className="relative w-full h-[280px] sm:h-[400px] md:h-[500px] flex items-center justify-center text-center"
          style={{
            backgroundImage: "url('/clgimg3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10"></div>
          <h1 className="relative z-10 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-xl px-4 max-w-4xl leading-snug">
            Welcome to KPT Co-Operative Society Mangalore
          </h1>
        </div>

        {/* About Section */}
        <div className="px-4 sm:px-6 md:px-10 py-8 sm:py-10 text-gray-800 leading-relaxed space-y-6">
          <p className="text-base sm:text-lg">
            The{" "}
            <strong className="font-semibold text-red-600">
              Karnataka Government Polytechnic (KPT) Cooperative Society
            </strong>{" "}
            was established in <strong className="font-semibold">1958</strong>.
            As per records, the official registration date is{" "}
            <strong className="font-semibold">29th August 1958</strong>. Since
            its inception, the society has actively contributed to the financial
            welfare of its members.
          </p>

          {/* Objectives Section */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-700 mt-6 sm:mt-8 border-l-4 border-pink-400 pl-3 sm:pl-4">
            Objectives of the Association
          </h2>
          <ul className="list-disc pl-6 sm:pl-8 space-y-2 sm:space-y-3 text-base sm:text-lg">
            <li>
              Provide loans to members and depositors for productive purposes.
            </li>
            <li>Promote thrift, self-help, and cooperation among members.</li>
            <li>Collect capital through shares, deposits, and loans.</li>
            <li>Supply educational materials for members and students.</li>
            <li>Implement student scholarships and welfare programs.</li>
            <li>
              Raise and manage capital to fulfill the association’s objectives.
            </li>
            <li>
              Undertake works aligned with bylaws and goals of the society.
            </li>
          </ul>

          {/* Fund Section */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-700 mt-6 sm:mt-8 border-l-4 border-pink-400 pl-3 sm:pl-4">
            Working Capital / Fund Collection
          </h2>
          <p className="text-base sm:text-lg">
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
