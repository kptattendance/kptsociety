import Image from "next/image";
import Link from "next/link";
import { Twitter, Github, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full px-3 sm:px-6 pb-3 sm:pb-6">
      <div className="max-w-7xl mx-auto rounded-[28px] sm:rounded-[36px] bg-gray-900 text-gray-300 overflow-hidden relative">
      <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-purple-400/25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl"></div>
      <div className="relative px-6 sm:px-10 lg:px-14 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo + About */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-white">
              <Image
                src="/logo1.png"
                alt="KPT Society Logo"
                width={30}
                height={30}
              />
              </span>
              <span className="text-lg font-extrabold text-white">
                KPT Society
              </span>
            </Link>
            <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-xs">
              KPT Society is dedicated to helping members with savings, loans,
              and financial growth.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid place-items-center w-9 h-9 rounded-full bg-white/10 text-gray-300 hover:bg-pink-300 hover:text-gray-900 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid place-items-center w-9 h-9 rounded-full bg-white/10 text-gray-300 hover:bg-pink-300 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid place-items-center w-9 h-9 rounded-full bg-white/10 text-gray-300 hover:bg-pink-300 hover:text-gray-900 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h2 className="text-xs font-bold tracking-[0.2em] text-pink-200 mb-5">RESOURCES</h2>
            <ul className="text-sm text-gray-300 space-y-2 list-none">
              <li>
                <a
                  href="https://gpt.karnataka.gov.in/kptmangalore/public/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  KPT Website
                </a>
              </li>
              <li>
                <Link
                  href="https://www.kptplacements.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  KPT Placements
                </Link>
              </li>
              <li>
                <Link
                  href="https://kptblogs.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  KPT Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.kptsociety.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  KPT Alumni
                </Link>
              </li>
            </ul>
          </div>

          {/* Important Links */}
          <div className="text-center md:text-left">
            <h2 className="text-xs font-bold tracking-[0.2em] text-pink-200 mb-5">
              IMPORTANT LINKS
            </h2>
            <ul className="text-sm text-gray-300 space-y-2 list-none">
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-white">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h2 className="text-xs font-bold tracking-[0.2em] text-pink-200 mb-5">CONTACT</h2>
            <ul className="text-sm text-gray-300 space-y-3 list-none">
              <li className="flex justify-center md:justify-start items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <span>
                  VVR3+MMP, Kadri Hills, Kadri,
                  <br />
                  Mangaluru, Karnataka 575004.
                </span>
              </li>
              <li className="flex justify-center md:justify-start items-center gap-2">
                <Phone className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <a href="tel:+918123456789" className="hover:text-white">
                  +91-9741127644 / +91-9742023708{" "}
                </a>
              </li>
              <li className="flex justify-center md:justify-start items-center gap-2">
                <Mail className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <a
                  href="mailto:info@kptsociety.com"
                  className="hover:text-white"
                >
                  kptsociety@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative border-t border-white/10 py-5 px-6 sm:px-10 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <p className="text-xs md:text-sm text-gray-400">
          © {new Date().getFullYear()} KPT Society. All Rights Reserved.
        </p>
        <p className="text-xs md:text-sm text-gray-400">
          Developed and maintained by KPT CSE Final Year Students.
        </p>
      </div>
      </div>
    </footer>
  );
}
