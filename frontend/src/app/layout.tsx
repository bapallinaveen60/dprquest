import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GPM-DPR Explorer: Satellite Rainfall Retrieval Learning Platform",
  description: "An interactive educational platform to learn the GPM Dual-frequency Precipitation Radar Level-2 algorithm through simulations, storytelling, and real HDF5 granules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-space-950 text-gray-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navigation />
        <main className="min-h-screen pl-0 lg:pl-64 pt-16 lg:pt-0 flex flex-col transition-all duration-300">
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
