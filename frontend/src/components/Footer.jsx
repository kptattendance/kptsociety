import Image from "next/image";
import Link from "next/link";
import { Twitter, Github, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200">
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo + About */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo1.png"
                alt="KPT Society Logo"
                width={40}
                height={40}
              />
              <span className="text-lg font-bold text-indigo-600">
                KPT Society
              </span>
            </Link>
            <p className="mt-6 text-sm text-gray-600 leading-relaxed max-w-xs">
              KPT Society is dedicated to helping members with savings, loans,
              and financial growth.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h2 className="font-semibold text-gray-900 mb-5">RESOURCES</h2>
            <ul className="text-sm text-gray-600 space-y-2 list-none">
              <li>
                <a
                  href="https://gpt.karnataka.gov.in/kptmangalore/public/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600"
                >
                  KPT Website
                </a>
              </li>
              <li>
                <Link
                  href="https://www.kptplacements.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600"
                >
                  KPT Placements
                </Link>
              </li>
              <li>
                <Link
                  href="https://kptblogs.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600"
                >
                  KPT Blogs
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.kptsociety.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600"
                >
                  KPT Alumni
                </Link>
              </li>
            </ul>
          </div>

          {/* Important Links */}
          <div className="text-center md:text-left">
            <h2 className="font-semibold text-gray-900 mb-5">
              IMPORTANT LINKS
            </h2>
            <ul className="text-sm text-gray-600 space-y-2 list-none">
              <li>
                <Link href="/terms" className="hover:text-indigo-600">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-indigo-600">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-indigo-600">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h2 className="font-semibold text-gray-900 mb-5">CONTACT</h2>
            <ul className="text-sm text-gray-600 space-y-3 list-none">
              <li className="flex justify-center md:justify-start items-start gap-2">
                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  VVR3+MMP, Kadri Hills, Kadri,
                  <br />
                  Mangaluru, Karnataka 575004.
                </span>
              </li>
              <li className="flex justify-center md:justify-start items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <a href="tel:+918123456789" className="hover:text-indigo-600">
                  +91 81234 56789
                </a>
              </li>
              <li className="flex justify-center md:justify-start items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <a
                  href="mailto:info@kptsociety.com"
                  className="hover:text-indigo-600"
                >
                  info@kptsociety.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 py-4 px-6 md:px-16 lg:px-24 xl:px-32 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <p className="text-xs md:text-sm text-gray-500">
          © {new Date().getFullYear()} KPT Society. All Rights Reserved.
        </p>
        <p className="text-xs md:text-sm text-gray-500">
          Developed and maintained by KPT CSE Final Year Students.
        </p>
      </div>
    </footer>
  );
}
