import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stratus Creative — Professional Websites for Local Businesses",
  description:
    "We build professional, mobile-friendly websites for local service businesses. No hassle, no DIY. We handle everything.",
  openGraph: {
    title: "Stratus Creative — Professional Websites for Local Businesses",
    description:
      "We build professional, mobile-friendly websites for local service businesses. No hassle, no DIY. We handle everything.",
    url: "https://stratus-creative.com",
    siteName: "Stratus Creative",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
