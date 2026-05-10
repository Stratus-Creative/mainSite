import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  LocalBusinessJsonLd,
  OrganizationJsonLd,
  PersonJsonLd,
  WebsiteJsonLd,
} from "@/components/structured-data";
import { ClarityScript } from "@/components/clarity-script";
import { ChatWidget } from "@/components/chat-widget";
import { PageViewTracker } from "@/components/page-view-tracker";
import { PageTransition } from "@/components/motion";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stratus-creative.com"),
  title: {
    default: "Stratus Creative — Websites, workflows, and online presence",
    template: "%s · Stratus Creative",
  },
  description:
    "We build websites, workflows, and online presence for businesses that want to look bigger than they are. Productized starter sites, custom AI workflows, and transparent pricing.",
  keywords: [
    "creative agency",
    "web design",
    "web development",
    "AI workflow automation",
    "AI agents",
    "AI chatbots",
    "Google Business Profile",
    "reputation management",
    "local SEO",
    "Simpsonville SC",
    "small business website",
    "Next.js agency",
  ],
  authors: [{ name: "Stratus Creative" }],
  openGraph: {
    title: "Stratus Creative — Websites, workflows, and online presence",
    description:
      "Websites, workflows, and online presence for businesses that want to look bigger than they are.",
    url: "https://stratus-creative.com",
    siteName: "Stratus Creative",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stratus Creative",
    description:
      "Websites, workflows, and online presence for businesses that want to look bigger than they are.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PageTransition>{children}</PageTransition>
        <OrganizationJsonLd />
        <PersonJsonLd />
        <WebsiteJsonLd />
        <LocalBusinessJsonLd />
        <ChatWidget />
        <ClarityScript />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
