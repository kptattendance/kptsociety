"use client";
import React, { useState } from "react";
import { MapPin, Mail, Phone, Send } from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ Your actual Google Form “formResponse” URL
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdVgJhylYUGifXu1eDe6qNcvIYy987wchnUCQnQ6G9W9Bhqxg/formResponse";

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
      await fetch(GOOGLE_FORM_ACTION, { // <-- Make sure this URL is fixed
        method: "POST",
        mode: "no-cors",
        body: form,
      });

      // ---- THIS IS THE FIX ----
      // With "no-cors", the fetch is "opaque," so we can't read the response.
      // We will *assume* it was successful if no network error was thrown.
      // Move the success logic here, *outside* the try block.
      
      alert("✅ Message sent successfully! Thank you for your feedback 🙏");
      setFormData({ name: "", email: "", message: "" });
      
    } catch (err) {
      // This will now only catch actual network errors (e.g., user is offline)
      alert("❌ A network error occurred! Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="px-4 sm:px-6 pb-16 sm:pb-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Get in touch
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900">
            Contact Us
          </h2>
        </div>

        <div className="mt-8 grid lg:grid-cols-5 gap-5 sm:gap-6">
          {/* 📍 Google Map + Contact Info */}
          <div className="lg:col-span-3 flex flex-col rounded-[28px] overflow-hidden bg-white shadow-soft ring-1 ring-gray-100">
            <div className="relative h-64 sm:h-80 lg:flex-1 lg:min-h-[320px] bg-blue-50">
              <iframe
                width="100%"
                height="100%"
                className="absolute inset-0"
                frameBorder="0"
                title="KPT Co-operative Society Location"
                marginHeight="0"
                marginWidth="0"
                scrolling="no"
                loading="lazy"
                src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Karnataka%20(Govt.)%20Polytechnic%20Mangalore&ie=UTF8&t=&z=14&iwloc=B&output=embed"
                style={{ filter: "saturate(0.6) hue-rotate(10deg)" }}
              ></iframe>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 p-5 sm:p-6">
              <div className="flex gap-3">
                <span className="grid place-items-center shrink-0 w-10 h-10 rounded-xl bg-purple-100 text-purple-700">
                  <MapPin className="w-5 h-5" />
                </span>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="mt-0.5 text-gray-600 leading-relaxed">
                    KPT Co-operative Society Office, Karnataka (Govt.)
                    Polytechnic, Kadri Hills, Mangalore – 575004, Karnataka
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="grid place-items-center shrink-0 w-10 h-10 rounded-xl bg-pink-100 text-pink-700">
                  <Mail className="w-5 h-5" />
                </span>
                <div className="text-sm min-w-0">
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a
                    href="mailto:kptsociety@gmail.com"
                    className="mt-0.5 block text-blue-700 hover:underline break-all"
                  >
                    kptsociety@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="grid place-items-center shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-700">
                  <Phone className="w-5 h-5" />
                </span>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="mt-0.5 text-gray-600 leading-relaxed">
                    +91-9741127644
                    <br />
                    +91-9742023708
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 📨 Feedback Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 flex flex-col rounded-[28px] bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6 sm:p-8 ring-1 ring-purple-100"
          >
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Feedback
            </h3>
            <p className="mt-1 mb-6 text-sm sm:text-base text-gray-600 leading-relaxed">
              We’d love to hear from you! Please share your feedback or
              suggestions below.
            </p>

            <div className="mb-4">
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-base"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-base"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="message" className="block mb-1 text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                required
                className="w-full h-32 px-4 py-3 rounded-xl border bg-white text-gray-800 text-base resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Sending..." : "Send Message"}
            </button>

            <p className="text-xs text-gray-500 mt-3">
              Thank you for connecting with KPT Co-operative Society.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
