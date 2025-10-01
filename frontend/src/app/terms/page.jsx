// app/terms-and-conditions/page.jsx (Next.js 13+ App Router)
// or pages/terms-and-conditions.jsx (Pages Router)

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400">
            Terms & Conditions
          </h1>
          <p className="text-gray-300">
            Please read the following terms carefully before using the KPT
            Cooperative Society Portal.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <Section
            title="1. Introduction"
            points={[
              "These Terms & Conditions govern the use of the KPT Cooperative Society Portal.",
              "By registering and accessing your account, you agree to comply with these terms.",
            ]}
          />
          <Section
            title="2. Membership"
            points={[
              "Only staff and approved members of KPT Cooperative Society are eligible to use this portal.",
              "Each member is responsible for maintaining the confidentiality of their login credentials.",
              "Membership is non-transferable.",
            ]}
          />
          <Section
            title="3. Account Information"
            points={[
              "Members can view details of deposits, loans, repayments, FDs, and RDs online.",
              "The information displayed is sourced from society records and updated by the Admin.",
              "Any discrepancies must be reported to the Admin immediately.",
            ]}
          />
          <Section
            title="4. Deposits & Loans"
            points={[
              "Deposits (FD, RD, and others) are subject to the rules of KPT Cooperative Society.",
              "Loan applications are reviewed and approved at the discretion of the Admin.",
              "EMI calculations and repayment schedules are system-generated but manually recorded by the Admin.",
            ]}
          />
          <Section
            title="5. Transactions"
            points={[
              "All transactions recorded on the portal are final once entered by Admin.",
              "Members are encouraged to regularly check their transaction history.",
              "In case of errors, the Admin must be notified within 7 working days.",
            ]}
          />
          <Section
            title="6. Privacy & Data Security"
            points={[
              "Member data will be used only for maintaining society records.",
              "Personal details will not be shared with third parties without consent.",
              "The society is not liable for data leaks due to external cyberattacks.",
            ]}
          />
          <Section
            title="7. Responsibilities of Members"
            points={[
              "Provide accurate information during registration.",
              "Keep login credentials secure.",
              "Regularly update personal details (e.g., contact information).",
            ]}
          />
          <Section
            title="8. Responsibilities of Admin"
            points={[
              "Maintain accurate financial records.",
              "Record repayments and deposits promptly.",
              "Resolve discrepancies in a fair and transparent manner.",
            ]}
          />
          <Section
            title="9. Limitations of Liability"
            points={[
              "The portal is a tool for convenience and reference.",
              "Final financial records are maintained by the society office.",
              "The society is not responsible for technical downtime or errors caused by external services.",
            ]}
          />
          <Section
            title="10. Modifications"
            points={[
              "The society reserves the right to update these Terms & Conditions at any time.",
              "Members will be notified of significant changes via the portal or registered email.",
            ]}
          />
          <Section
            title="11. Governing Law"
            points={[
              "These Terms & Conditions are governed by the bylaws of KPT Cooperative Society and applicable state laws.",
              "Any disputes shall be subject to the jurisdiction of local courts.",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// Reusable Section Component
function Section({ title, points }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-md p-6 border border-white/10">
      <h2 className="text-xl font-semibold mb-3 text-cyan-300">{title}</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-200">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
