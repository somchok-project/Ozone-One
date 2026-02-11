import "@/styles/globals.css";

import { type Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Ozone One",
  description: "ตลาดโอโซนวัน",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${notoSansThai.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        <TRPCReactProvider>
          {/* <Navbar /> */}
          <main>{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
