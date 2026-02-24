import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "BTC Thermometer",
  description: "Bitcoin market thermometer dashboard",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "BTC Thermometer",
    description: "Bitcoin market thermometer dashboard",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BTC Thermometer"
      }
    ]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter bg-background text-primary">
        {children}
      </body>
    </html>
  );
}
