"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// รูปภาพสำหรับ Slideshow
const backgroundImages = [
  "/images/bg-ตลาดโอโซนวัน.jpg", 
  "/images/bg-ตลาดโอโซนวัน2.png", 
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    if (backgroundImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen w-full font-sans bg-white">
      
      {/* --- Left Side: Visual Storytelling (Hidden on Mobile) --- */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gray-900 lg:flex">
        
        {/* Slideshow Background */}
        <div className="absolute inset-0 z-0">
          {backgroundImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={img}
                alt="Atmosphere"
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
          {/* Gradient Overlay: ปรับให้ไล่เฉดสวยงาม อ่าน Text ง่าย */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex h-full flex-col justify-between px-16 py-16 text-white">
          
          {/* Top: Logo Area */}
          <div>
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
               {/* ใส่ Logo สีขาวที่นี่ ถ้าไม่มีใช้ text แทนได้ครับ */}
               <div className="text-2xl font-bold tracking-tight text-white">
                 OZONE<span className="text-orange-500">ONE</span>
               </div>
            </Link>
          </div>

          {/* Bottom: Hero Text & Stats */}
          <div className="space-y-12">
            <div className="max-w-lg space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                </span>
                <span className="text-xs font-medium tracking-wide text-orange-50 uppercase">
                  Available for Booking
                </span>
              </div>
              
              {/* Headline */}
              <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
                The New Standard <br />
                <span className="text-orange-500">of Trading.</span>
              </h1>
              
              <p className="text-lg font-light leading-relaxed text-gray-300">
                ยกระดับประสบการณ์การขายของคุณ ด้วยทำเลคุณภาพและระบบจัดการที่ทันสมัยที่สุด
              </p>
            </div>

            {/* Minimal Stats */}
            <div className="flex items-center gap-12 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold text-white">400+</p>
                <p className="mt-1 text-xs tracking-wider text-gray-400 uppercase">Spaces</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div> {/* Vertical Divider */}
              <div>
                <p className="text-3xl font-bold text-white">10k+</p>
                <p className="mt-1 text-xs tracking-wider text-gray-400 uppercase">Daily Visitors</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div>
                <p className="text-3xl font-bold text-white">4.8</p>
                <p className="mt-1 text-xs tracking-wider text-gray-400 uppercase">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Form Container --- */}
      <div className="flex w-full flex-col justify-center bg-white lg:w-1/2">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 lg:hidden">
          <Link href="/">
             <div className="text-xl font-bold tracking-tight text-gray-900">
                 OZONE<span className="text-orange-500">ONE</span>
             </div>
          </Link>
        </div>

        {/* Form Scroll Area */}
        <div className="flex h-full w-full items-center justify-center overflow-y-auto px-4 py-12 sm:px-12 lg:px-20">
            {/* ตัว children (LoginPage) จะถูก render ตรงนี้ */}
            {children}
        </div>
      </div>
    </div>
  );
}