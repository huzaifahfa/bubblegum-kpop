import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baboSorry = localFont({
  src: "../public/소야바른9-babosorry.ttf",
  variable: "--font-pixelify-sans", // keeps page.tsx unchanged
});

export const metadata: Metadata = {
  title: "KOR 10 Project",
  description: "KOR 10 Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baboSorry.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<Analytics/></body>
    </html>
  );
}
