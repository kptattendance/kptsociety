// app/privacy-policy/page.jsx (Next.js 13+ App Router)
// or pages/privacy-policy.jsx (Pages Router)

import Footer from "../../components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-cyan-900 to-indigo-900 text-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Privacy Policy
            </h1>
            <p className="text-gray-300">
              This Privacy Policy explains how the KPT Cooperative Society
              Portal collects, uses, and protects member information.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <Section
              title="1. Information We Collect"
              points={[
                "Personal details such as name, staff ID, email address, and contact number.",
                "Financial records including deposits, loans, repayments, FDs, and RDs.",
                "System-generated data such as login timestamps and account activity.",
              ]}
            />
            <Section
              title="2. How We Use Information"
              points={[
                "To maintain accurate financial records for members.",
                "To process loan requests, deposits, and repayments.",
                "To communicate important updates regarding accounts or policies.",
              ]}
            />
            <Section
              title="3. Data Security"
              points={[
                "We implement administrative, technical, and physical safeguards to protect member data.",
                "Access to sensitive data is restricted to authorized Admins only.",
                "Despite best efforts, no system can guarantee 100% security.",
              ]}
            />
            <Section
              title="4. Sharing of Information"
              points={[
                "Member data will not be sold, rented, or shared with third parties for commercial purposes.",
                "Data may be shared with government or regulatory bodies if legally required.",
                "Limited third-party services (e.g., cloud hosting) may process data securely on our behalf.",
              ]}
            />
            <Section
              title="5. Member Responsibilities"
              points={[
                "Members must provide accurate personal information during registration.",
                "Members are responsible for maintaining the confidentiality of login credentials.",
                "Members should promptly notify the Admin of any unauthorized account activity.",
              ]}
            />
            <Section
              title="6. Cookies & Tracking"
              points={[
                "The portal may use cookies to improve user experience and maintain session security.",
                "No personal financial information is stored in cookies.",
                "Members can disable cookies in their browser settings, but some features may not function properly.",
              ]}
            />
            <Section
              title="7. Changes to Privacy Policy"
              points={[
                "The society reserves the right to update this Privacy Policy as needed.",
                "Members will be notified of major changes through the portal or registered email.",
              ]}
            />
            <Section
              title="8. Contact Information"
              points={[
                "For questions regarding this Privacy Policy, members may contact the society office directly.",
              ]}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Reusable Section Component
function Section({ title, points }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-md p-6 border border-white/10">
      <h2 className="text-xl font-semibold mb-3 text-emerald-300">{title}</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-200">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
