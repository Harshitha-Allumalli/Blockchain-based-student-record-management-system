import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/Toast";
import Chatbot from "@/components/Chatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlockEdu | Blockchain Student Records",
  description: "Secure, tamper-proof student record management using blockchain technology.",
  keywords: ["blockchain", "student records", "academic credentials", "verification"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
        <ToastContainer />
        <Chatbot />
      </body>
    </html>
  );
}
