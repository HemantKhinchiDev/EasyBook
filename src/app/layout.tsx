import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use next/font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyBook - Shopkeeper Tools",
  description: "Transform your Google Maps listing into a booking machine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className + " overflow-x-hidden"}>{children}</body>
    </html>
  );
}
