import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KPT Co-operative Society | Trusted Financial & Community Services",
  description:
    "KPT Co-operative Society empowers individuals and communities by offering reliable financial services, savings schemes, and development initiatives for a better future.",
  keywords: [
    "KPT Society",
    "KPT Co-operative Society",
    "KPT Cooperative Bank",
    "Financial Services",
    "Savings",
    "Loans",
    "Deposits",
    "Co-operative Credit Society",
    "Mysuru",
    "Karnataka",
    "Community Development",
  ],
  authors: [{ name: "KPT Co-operative Society" }],
  creator: "KPT Co-operative Society",
  publisher: "KPT Co-operative Society",
  metadataBase: new URL("https://kptsociety.vercel.app"),
  alternates: {
    canonical: "https://kptsociety.vercel.app",
  },
  openGraph: {
    title:
      "KPT Co-operative Society | Empowering Communities through Cooperation",
    description:
      "Providing trusted co-operative banking, savings, and financial solutions across Karnataka.",
    url: "https://kptsociety.vercel.app",
    siteName: "KPT Co-operative Society",
    images: [
      {
        url: "https://kptsociety.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KPT Co-operative Society",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KPT Co-operative Society | Financial Empowerment for All",
    description:
      "Join KPT Co-operative Society — trusted community banking and financial growth since establishment.",
    creator: "@kptsociety",
    images: ["https://kptsociety.vercel.app/images/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* ✅ Google Search Console verification */}
          <meta
            name="google-site-verification"
            content="hGeqexIXtc7NST6rn4KQBNM1HZTC9o1YJggaCvKXINU"
          />

          {/* ✅ Structured Data (Organization Schema) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "KPT Co-operative Society",
                url: "https://kptsociety.vercel.app",
                logo: "https://kptsociety.vercel.app/images/logo.png",
                description:
                  "KPT Co-operative Society is dedicated to providing financial support, savings, and community growth opportunities through cooperative principles.",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Karnataka (Govt.) Polytechnic, Kadri Hills",
                  addressLocality: "Mangalore",
                  addressRegion: "Karnataka",
                  postalCode: "575004",
                  addressCountry: "IN",
                },
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+91-9591228330",
                  contactType: "Customer Service",
                  areaServed: "IN",
                  availableLanguage: ["English", "Kannada"],
                },
                sameAs: [
                  "https://www.facebook.com/kptsociety",
                  "https://www.instagram.com/kptsociety",
                  "https://www.linkedin.com/company/kptsociety",
                ],
              }),
            }}
          />
        </head>

        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <Navbar />
          <main className="flex-grow overflow-hidden">
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
