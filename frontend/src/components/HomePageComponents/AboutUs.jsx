"use client";

import { motion } from "framer-motion";
import {
  HandCoins,
  Sprout,
  Users,
  BookOpen,
  GraduationCap,
  Landmark,
  ScrollText,
  ArrowRight,
} from "lucide-react";

const objectives = [
  {
    icon: HandCoins,
    text: "Provide loans to members and depositors for productive purposes.",
  },
  { icon: Sprout, text: "Promote thrift, self-help, and cooperation among members." },
  { icon: Landmark, text: "Collect capital through shares, deposits, and loans." },
  { icon: BookOpen, text: "Supply educational materials for members and students." },
  { icon: GraduationCap, text: "Implement student scholarships and welfare programs." },
  { icon: Users, text: "Raise and manage capital to fulfill the association’s objectives." },
  { icon: ScrollText, text: "Undertake works aligned with bylaws and goals of the society." },
];

const highlights = [
  { value: "1958", label: "Established" },
  { value: "65+", label: "Years of service" },
  { value: "5", label: "Savings & loan schemes" },
];

const iconTints = [
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
];

export default function AboutUs() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative px-3 sm:px-6 pt-3 sm:pt-6">
        <div
          className="relative max-w-7xl mx-auto overflow-hidden rounded-[28px] sm:rounded-[36px] min-h-[420px] sm:min-h-[520px] flex items-end"
          style={{
            backgroundImage: "url('/clgimg3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/45 to-purple-900/10"></div>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-pink-300/40 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-300/40 blur-3xl"></div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 w-full p-6 sm:p-10 md:p-14"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 px-3 py-1 text-xs sm:text-sm font-medium text-white">
              <span className="w-2 h-2 rounded-full bg-pink-300"></span>
              Serving members since 1958
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] max-w-3xl">
              Welcome to KPT{" "}
              <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                Co-Operative Society
              </span>{" "}
              Mangalore
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-lg text-white/80">
              Savings, deposits, and loans for the KPT family, built on trust,
              thrift, and cooperation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-lg hover:bg-pink-50 transition-colors"
              >
                Explore services <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Contact us
              </a>
            </div>
          </motion.div>
        </div>

        {/* Highlights */}
        <div className="relative z-10 max-w-5xl mx-auto -mt-8 sm:-mt-10 px-2 sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-soft ring-1 ring-purple-100 p-3 sm:p-5">
            {highlights.map((h) => (
              <div key={h.label} className="text-center px-1">
                <p className="text-xl sm:text-3xl font-extrabold brand-gradient-text">
                  {h.value}
                </p>
                <p className="text-[11px] sm:text-sm text-gray-500 font-medium">
                  {h.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-5 gap-10 lg:gap-14">
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
            About us
          </p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900">
            A society built by members, for members
          </h2>
          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
            The{" "}
            <strong className="font-semibold text-purple-700">
              Karnataka Government Polytechnic (KPT) Cooperative Society
            </strong>{" "}
            was established in <strong className="font-semibold text-gray-800">1958</strong>.
            As per records, the official registration date is{" "}
            <strong className="font-semibold text-gray-800">29th August 1958</strong>. Since
            its inception, the society has actively contributed to the financial
            welfare of its members.
          </p>

          <div className="mt-8 rounded-3xl bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-6 ring-1 ring-purple-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Working Capital / Fund Collection
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
              The society manages its funds through share capital, member
              deposits, and loans. These resources are utilized to provide
              financial assistance and welfare benefits for the members and
              their families.
            </p>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="lg:col-span-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
            Objectives of the Association
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {objectives.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-gray-100 hover:ring-purple-200 transition"
              >
                <span
                  className={`grid place-items-center shrink-0 w-10 h-10 rounded-xl ${iconTints[i % 3]}`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-sm sm:text-[15px] text-gray-700 leading-relaxed pt-1.5">
                  {text}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
