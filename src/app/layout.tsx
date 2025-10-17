import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ExamProvider } from "@/contexts/ExamContext";
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
  title: "AI Math Platform",
  description: "AI 驅動的數學學習平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ExamProvider>
          {children}
        </ExamProvider>
      </body>
    </html>
  );
}
