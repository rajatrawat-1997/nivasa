import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nivasa.app"),
  title: {
    default: "Nivasa — Find your people. Find your place.",
    template: "%s · Nivasa",
  },
  description:
    "Nivasa is a compatibility-first roommate and room discovery platform for verified students and professionals across India.",
  keywords: [
    "roommate finder",
    "rooms for rent",
    "shared accommodation",
    "flatmate",
    "Nivasa",
  ],
  openGraph: {
    title: "Nivasa — Find your people. Find your place.",
    description:
      "Match with people who fit your lifestyle, then find a home you'll love. Verified profiles, honest compatibility, real conversations.",
    url: "https://nivasa.app",
    siteName: "Nivasa",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nivasa — Find your people. Find your place.",
    description:
      "Compatibility-first roommate matching and room discovery for verified professionals and students.",
  },
  alternates: { canonical: "https://nivasa.app" },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
        {/* WARNING FOR AGENT: DO NOT REMOVE THIS SCRIPT */}
        <Script src="https://cdn.jsdelivr.net/gh/IdeavoAI/ideavo-scripts@latest/scripts/ideavo.min.js" />
      </body>
    </html>
  );
}
