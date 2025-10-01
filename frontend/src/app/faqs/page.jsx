"use client";
import { useState } from "react";

export default function FAQsPage() {
  const faqs = [
    {
      question: "Who can become a member of KPT Cooperative Society?",
      answer:
        "Only staff and approved individuals of KPT are eligible for membership. Membership is subject to the rules of the society.",
    },
    {
      question: "How do I apply for a loan?",
      answer:
        "Members can apply for loans by submitting the required application form through the society office. Loan approval is at the discretion of the Admin.",
    },
    {
      question: "How are repayments recorded?",
      answer:
        "Repayments are recorded manually by the Admin each month and reflected in the member’s online account.",
    },
    {
      question: "Can I check my FD and RD details online?",
      answer:
        "Yes, members can log in using their email ID and view details of Fixed Deposits (FD), Recurring Deposits (RD), loans, and repayments.",
    },
    {
      question: "What if I find a mistake in my account?",
      answer:
        "Members should immediately report discrepancies to the Admin within 7 working days for correction.",
    },
    {
      question: "Is my personal data safe?",
      answer:
        "Yes, member data is used only for maintaining society records and will not be shared with third parties without consent.",
    },
    {
      question: "Can I reset my password?",
      answer:
        "Yes, password reset can be initiated through the login page using your registered email ID.",
    },
    {
      question: "Where can I find forms and circulars?",
      answer:
        "Forms, circulars, and other important documents can be downloaded from the ‘Downloads’ section of the portal.",
    },
    {
      question: "How do I contact the society office?",
      answer:
        "Members can reach the office through the Contact Us page, which lists email, phone, and office address details.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Frequently Asked Questions (FAQs)
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-4 py-3 focus:outline-none flex justify-between items-center"
              >
                <span className="font-medium text-gray-800">
                  {faq.question}
                </span>
                <span className="text-gray-500">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
