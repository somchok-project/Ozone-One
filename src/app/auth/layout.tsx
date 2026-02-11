"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// รูปภาพสำหรับ Slideshow (เปลี่ยนเป็น URL รูปจริงของคุณ)
const backgroundImages = [
  "/images/bg-ตลาดโอโซนวัน.jpg", // รูปหลัก
  "/images/bg-ตลาดโอโซนวัน2.png", // รูปสำรอง 1

];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); // เปลี่ยนทุก 6 วินาที
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* --- Left Side: Aesthetic & Branding --- */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gray-900 lg:flex">
        
        {/* Slideshow Background */}
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Overlay Gradient (Minimal Luxury Mood) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />

        {/* Content Layer */}
        <div className="relative z-20 flex h-full flex-col justify-between px-16 py-16">
          {/* Top: Logo */}
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/images/svg/logo-white.svg" // ตรวจสอบ path logo ขาว
              alt="Ozone One"
              width={160}
              height={45}
              className="h-10 w-auto opacity-90"
            />
          </Link>

          {/* Bottom: Text & Stats */}
          <div className="space-y-10">
            <div className="max-w-lg space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                </span>
                <span className="text-xs font-medium tracking-wide text-orange-100 uppercase">
                  Open for Booking
                </span>
              </div>
              
              <h1 className="font-serif text-5xl leading-tight text-white lg:text-6xl">
                The New Standard <br />
                <span className="italic text-orange-200/90">of Trading.</span>
              </h1>
              
              <p className="text-lg font-light leading-relaxed text-gray-300">
                ยกระดับประสบการณ์การขายของคุณ ด้วยทำเลคุณภาพและระบบจัดการที่ทันสมัยที่สุด
              </p>
            </div>

            {/* Glass Stats */}
            <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="font-serif text-3xl text-white">400+</p>
                <p className="text-xs tracking-wider text-gray-400 uppercase">Spaces</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-white">10k+</p>
                <p className="text-xs tracking-wider text-gray-400 uppercase">Visitors</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-white">4.8</p>
                <p className="text-xs tracking-wider text-gray-400 uppercase">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Clean Form --- */}
      <div className="flex w-full flex-col bg-white lg:w-1/2">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white p-6 lg:hidden">
          <Link href="/">
            <Image
              src="/images/svg/logo.svg"
              alt="Ozone One"
              width={120}
              height={35}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20 xl:px-28">
          {children}
        </div>
      </div>
    </div>
  );
}