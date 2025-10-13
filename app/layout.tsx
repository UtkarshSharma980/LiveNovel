import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SyncStatusBar from "@/components/SyncStatusBar";
import DBInitializer from "@/components/DBInitializer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LiveNovel - Read Web Novels Online",
  description: "A modern web novel reading platform with bookmark support and clean reading interface",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LiveNovel",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "LiveNovel",
    title: "LiveNovel - Read Web Novels Online",
    description: "A modern web novel reading platform with bookmark support and clean reading interface",
  },
  twitter: {
    card: "summary",
    title: "LiveNovel - Read Web Novels Online",
    description: "A modern web novel reading platform with bookmark support and clean reading interface",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="application-name" content="LiveNovel" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LiveNovel" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
        <DBInitializer />
        <Navbar />
        <main>
          {children}
        </main>
        <SyncStatusBar />
      </body>
    </html>
  );
}
