import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Noto_Sans_Thai } from "next/font/google";

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

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${geist.variable} ${notoSansThai.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <TRPCReactProvider>
          {/* <Navbar /> */}
          <main>{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
