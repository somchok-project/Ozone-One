import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "SpotRent - ระบบจัดการบูธ",
  description: "ระบบจัดการเช่าบูธอัจฉริยะ",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <TRPCReactProvider>
          <Navbar />
          <main>{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
