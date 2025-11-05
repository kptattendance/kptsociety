//layout.js
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
  title:
    "KPT Co-operative Society | Trusted Financial & Community Services in Mangalore",
  description:
    "KPT Co-operative Society, Mangalore – providing trusted financial, savings, and loan services for students, staff, and the local community. Empowering financial growth through cooperation.",
  keywords: [
    "kpt society",
    "KPT Society",
    "KPT Co-operative Society",
    "KPT Cooperative Bank",
    "KPT Society Mangalore",
    "KPT Co-operative Society Mangalore",
    "KPT Financial Services",
    "KPT Finance",
    "KPT Society Kadri Hills",
    "Co-operative Credit Society",
    "Financial Services in Mangalore",
    "Co-operative Banking Karnataka",
    "Loans",
    "society app",
    "kpt society app",
    "Deposits",
    "Savings Schemes",
    "Mangalore Cooperative",
    "Community Development",
    "Karnataka Polytechnic Society",
    "KPT College Society",
  ],
  authors: [{ name: "KPT Co-operative Society" }],
  creator: "KPT Co-operative Society",
  publisher: "KPT Co-operative Society",
  metadataBase: new URL("https://www.kptsociety.in"),
  alternates: {
    canonical: "https://www.kptsociety.in",
  },
  openGraph: {
    title:
      "KPT Co-operative Society | Empowering Financial Growth in Mangalore",
    description:
      "Providing reliable co-operative banking, savings, and financial solutions across Karnataka. Join KPT Society for your financial future.",
    url: "https://www.kptsociety.in",
    siteName: "KPT Co-operative Society",
    images: [
      {
        url: "https://www.kptsociety.in/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KPT Co-operative Society Mangalore",
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
    images: ["https://www.kptsociety.in/images/og-image.jpg"],
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
          {/* ✅ Google Search Console Verification */}
          <meta
            name="google-site-verification"
            content="hGeqexIXtc7NST6rn4KQBNM1HZTC9o1YJggaCvKXINU"
          />

          {/* ✅ Additional Meta Tags for SEO */}
          <meta
            name="robots"
            content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
          />
          <meta name="language" content="English" />
          <meta name="revisit-after" content="7 days" />
          <meta name="author" content="KPT Co-operative Society" />
          <meta
            name="googlebot"
            content="index,follow,snippet,archive,imageindex"
          />
          <meta name="bingbot" content="index,follow" />

          {/* ✅ Schema.org Structured Data (Financial Service) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FinancialService",
                name: "KPT Co-operative Society",
                url: "https://www.kptsociety.in",
                logo: "https://www.kptsociety.in/images/logo.png",
                description:
                  "KPT Co-operative Society is a Mangalore-based financial institution offering savings, loans, deposits, and cooperative development services.",
                foundingDate: "2010",
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
                  "https://www.youtube.com/@kptsociety",
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
        </body>
      </html>
    </ClerkProvider>
  );
}
