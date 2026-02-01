import React from 'react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between bg-zinc-900 p-10 text-white">

        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg-ตลาดโอโซนวัน.jpg" 
            alt="SpotRent Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end">
          {/* Bottom Text Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-gray-900 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Street View Supported
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold leading-tight">
                เห็นภาพสถานที่จริง <br /> ก่อนตัดสินใจเช่า
              </h1>
              <p className="text-gray-300 max-w-md text-sm leading-relaxed">
                SpotRent ช่วยให้คุณสำรวจทำเล สิ่งอำนวยความสะดวก 
                และบรรยากาศโดยรอบได้ผ่านแผนที่แบบ Interactive
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- ฝั่งขวา: พื้นที่สำหรับ children (Form) --- */}
      <div className="flex w-full flex-col items-center justify-center bg-white lg:w-1/2">
        {children}
      </div>
    </div>
  );
}