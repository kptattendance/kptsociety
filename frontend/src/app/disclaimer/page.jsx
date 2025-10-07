// app/disclaimer/page.jsx (Next.js 13+ App Router)
// or pages/disclaimer.jsx (Pages Router)

import Footer from "../../components/Footer";

export default function Disclaimer() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 text-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">
              Disclaimer
            </h1>
            <p className="text-gray-300">
              Important information regarding the use of the KPT Cooperative
              Society Portal.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <Section
              title="1. General Information"
              points={[
                "The KPT Cooperative Society Portal is intended for use by registered members only.",
                "All information displayed is for reference and convenience purposes.",
                "Official records are maintained by the society office.",
              ]}
            />
            <Section
              title="2. Accuracy of Information"
              points={[
                "While efforts are made to keep account details updated, discrepancies may occur.",
                "Members should verify details with the Admin for confirmation.",
                "The society does not guarantee the completeness or accuracy of displayed data at all times.",
              ]}
            />
            <Section
              title="3. Financial Advice"
              points={[
                "The portal does not provide financial or investment advice.",
                "Decisions regarding deposits, loans, or withdrawals should be made after consulting the society office.",
              ]}
            />
            <Section
              title="4. Liability"
              points={[
                "The society shall not be held liable for any direct, indirect, or incidental damages resulting from the use of the portal.",
                "The portal may occasionally be unavailable due to maintenance or technical issues.",
              ]}
            />
            <Section
              title="5. External Services"
              points={[
                "The portal may integrate third-party services (e.g., email, cloud storage).",
                "The society is not responsible for downtime, errors, or breaches caused by third-party providers.",
              ]}
            />
            <Section
              title="6. Data Security"
              points={[
                "Member data is protected to the best extent possible.",
                "The society cannot guarantee protection against external cyberattacks or unauthorized access.",
                "Members are advised to keep login credentials confidential.",
              ]}
            />
            <Section
              title="7. Changes to Disclaimer"
              points={[
                "The society reserves the right to modify this Disclaimer at any time.",
                "Updates will be communicated through the portal or registered email.",
              ]}
            />
            <Section
              title="8. Acceptance of Disclaimer"
              points={[
                "By accessing and using the portal, members acknowledge and accept this Disclaimer.",
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
      <h2 className="text-xl font-semibold mb-3 text-pink-300">{title}</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-200">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
