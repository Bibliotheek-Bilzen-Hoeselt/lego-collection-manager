import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "LEGO Collectiebeheer",
  description: "Beheer en volg je LEGO-collectie op",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${geist.variable} h-full antialiased`}>
      <body className="bg-gray-50 min-h-full font-sans">
        <main className="max-w-2xl mx-auto px-4 pt-6 pb-28">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
