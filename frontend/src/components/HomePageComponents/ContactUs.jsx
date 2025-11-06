"use client";
import React, { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Your actual Google Form “formResponse” URL
  const GOOGLE_FORM_ACTION = "https://forms.gle/F7CisDwK7uHpYLN76";

  // ✅ Replace these entry IDs with your actual Google Form field IDs
  const ENTRY_NAME = "entry.51162402";
  const ENTRY_EMAIL = "entry.872119969";
  const ENTRY_MESSAGE = "entry.1208811262";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      alert("⚠ Please fill all fields before submitting.");
      return;
    }

    setSubmitting(true);

    const form = new FormData();
    form.append(ENTRY_NAME, formData.name);
    form.append(ENTRY_EMAIL, formData.email);
    form.append(ENTRY_MESSAGE, formData.message);

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: form,
      });

      alert("✅ Message sent successfully! Thank you for your feedback 🙏");

      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      alert("❌ Something went wrong! Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="text-gray-600 body-font relative">
      <div className="container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap">
        {/* 📍 Google Map + Contact Info */}
        <div className="lg:w-2/3 md:w-1/2 bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative">
          <iframe
            width="100%"
            height="100%"
            className="absolute inset-0"
            frameBorder="0"
            title="KPT Co-operative Society Location"
            marginHeight="0"
            marginWidth="0"
            scrolling="no"
            src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Karnataka%20(Govt.)%20Polytechnic%20Mangalore&ie=UTF8&t=&z=14&iwloc=B&output=embed"
            style={{ filter: "grayscale(1) contrast(1.2) opacity(0.4)" }}
          ></iframe>
          <div className="bg-white relative flex flex-wrap py-6 rounded shadow-md">
            <div className="lg:w-1/2 px-6">
              <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">
                ADDRESS
              </h2>
              <p className="mt-1">
                KPT Co-operative Society Office,
                <br />
                Karnataka (Govt.) Polytechnic,
                <br />
                Kadri Hills, Mangalore – 575004, Karnataka
              </p>
            </div>
            <div className="lg:w-1/2 px-6 mt-4 lg:mt-0">
              <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">
                EMAIL
              </h2>
              <a
                href="mailto:kptsociety@gmail.com"
                className="text-indigo-500 leading-relaxed"
              >
                kptsociety@gmail.com
              </a>
              <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4">
                PHONE
              </h2>
              <p className="leading-relaxed">+91-9741127644 / +91-9742023708</p>
            </div>
          </div>
        </div>

        {/* 📨 Feedback Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:w-1/3 md:w-1/2 bg-white flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0"
        >
          <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">
            Feedback
          </h2>
          <p className="leading-relaxed mb-5 text-gray-600">
            We’d love to hear from you! Please share your feedback or
            suggestions below.
          </p>

          <div className="relative mb-4">
            <label htmlFor="name" className="leading-7 text-sm text-gray-600">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>

          <div className="relative mb-4">
            <label htmlFor="email" className="leading-7 text-sm text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>

          <div className="relative mb-4">
            <label
              htmlFor="message"
              className="leading-7 text-sm text-gray-600"
            >
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              required
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Thank you for connecting with KPT Co-operative Society.
          </p>
        </form>
      </div>
    </section>
  );
}
