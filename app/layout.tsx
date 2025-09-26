import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LiveNovel - Read Web Novels Online",
  description: "A modern web novel reading platform with bookmark support and clean reading interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
