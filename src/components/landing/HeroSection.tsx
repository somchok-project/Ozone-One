"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F8F9FA] py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-[#F8F9FA] to-orange-50/30" />
        <svg
          className="absolute top-0 left-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Curve 1: Top Right - Large Orange Swoosh */}
          <path
            d="M1440 0H800C1000 150 1200 100 1440 300V0Z"
            fill="url(#paint0_linear)"
            className="opacity-40"
          />
          {/* Curve 2: Middle Flow - Soft Gray */}
          <path
            d="M0 400C300 350 500 500 800 400C1100 300 1300 450 1440 400V800H0V400Z"
            fill="white"
            className="opacity-40"
          />
          {/* Curve 3: Bottom Left - Accent */}
          <path
            d="M0 600C200 550 400 650 600 800H0V600Z"
            fill="url(#paint1_linear)"
            className="opacity-20"
          />

          <defs>
            <linearGradient
              id="paint0_linear"
              x1="1100"
              y1="0"
              x2="1300"
              y2="300"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFEDD5" /> {/* Orange-100 */}
              <stop offset="1" stopColor="#FFF7ED" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="paint1_linear"
              x1="0"
              y1="600"
              x2="300"
              y2="800"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FB923C" /> {/* Orange-400 */}
              <stop offset="1" stopColor="#FDBA74" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* 3. Soft Blurs (Orbs) - ปรับตำแหน่งให้ล้อกับ Curve */}
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-orange-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-50/30 blur-[100px]" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* --- LEFT: Text Content --- */}
          <div className="flex flex-col justify-center text-center lg:col-span-5 lg:text-left">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/60 px-4 py-1.5 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                </span>
                <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                  Ozone One Market
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl xl:text-7xl"
            >
              <span className="block font-light text-gray-600">The New</span>
              <span className="block">Standard of</span>
              <span className="relative whitespace-nowrap text-orange-600">
                {/* Underline Shape */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 418 42"
                  className="absolute top-2/3 left-0 -z-10 h-[0.5em] w-full fill-orange-200/50"
                  preserveAspectRatio="none"
                >
                  <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C46.169 14.6 21.418 17.065 6.326 20.649 1.487 21.795-1.07 26.696 1.706 30.697c2.316 3.336 6.551 4.542 10.457 3.52 9.079-2.378 19.347-4.499 30.347-6.236 43.15-6.816 110.154-10.235 198.243-7.55 88.089 2.685 142.302 11.233 162.729 15.694 5.289 1.156 10.996-1.748 12.716-6.992 1.76-5.368-1.558-11.23-7.052-12.716-17.584-4.757-69.83-13.682-166.729-15.542z" />
                </svg>
                <span className="relative drop-shadow-sm">Trading</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8 text-lg leading-relaxed font-light text-gray-600 md:text-xl lg:max-w-md"
            >
              ยกระดับประสบการณ์การค้าขายสู่มาตรฐานใหม่
              ในทำเลที่ถูกออกแบบอย่างพิถีพิถันเพื่อ &ldquo;ความสำเร็จ&rdquo;
              ของคุณ
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="#booths"
                className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full bg-gray-900 px-8 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-orange-600 hover:shadow-orange-500/30"
              >
                <span className="relative z-10">จองพื้นที่ขาย</span>
              </Link>

              <Link
                href="#overview"
                className="group flex h-14 items-center justify-center rounded-full border border-gray-200 bg-white/80 px-8 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
              >
                <span className="mr-2">สำรวจแผนผัง</span>
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* --- RIGHT: Floating Gallery --- */}
          <div className="relative mt-12 h-[500px] w-full lg:col-span-7 lg:mt-0 lg:h-[650px]">
            {/* Main Center Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/2 left-1/2 z-20 h-[380px] w-[280px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] bg-white p-2 shadow-2xl shadow-gray-200/50 transition-transform duration-500 hover:scale-[1.02] md:h-[480px] md:w-[340px]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <Image
                  src="/images/bg-ตลาดโอโซนวัน3.png"
                  alt="Main Atmosphere"
                  className="h-full w-full object-cover"
                  width={200}
                  height={200}
                />
                <div className="absolute bottom-6 left-6 z-20 text-white">
                  <p className="mb-2 inline-block rounded-md bg-white/20 px-2 py-1 text-xs font-medium tracking-wider uppercase opacity-90 backdrop-blur-sm">
                    Highlight
                  </p>
                  <p className="text-xl font-bold">โซนแฮงค์เอาท์</p>
                </div>
              </div>
            </motion.div>

            {/* Left Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-10 left-4 z-10 h-[220px] w-[160px] -rotate-6 overflow-hidden rounded-3xl bg-white/80 p-2 shadow-xl shadow-gray-200/50 backdrop-blur-md transition-all duration-500 hover:z-30 hover:scale-105 hover:rotate-0 md:top-20 md:left-12 md:h-[260px] md:w-[200px]"
            >
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/bg-ตลาดโอโซนวัน2.png"
                  alt="Food"
                  className="h-full w-full object-cover"
                  width={200}
                  height={200}
                />
              </div>
            </motion.div>

            {/* Right Top Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute top-8 right-4 z-10 h-[180px] w-[180px] rotate-3 overflow-hidden rounded-3xl bg-white/80 p-2 shadow-xl shadow-gray-200/50 backdrop-blur-md transition-all duration-500 hover:z-30 hover:scale-105 hover:rotate-0 md:top-16 md:right-16 md:h-[220px] md:w-[220px]"
            >
              <div className="absolute -top-0 -right-0 flex h-10 w-10 rotate-45 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>

              <div className="h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/bg-ตลาดโอโซนวัน.jpg"
                  alt="Shopping"
                  className="h-full w-full object-cover"
                  width={200}
                  height={200}
                />
              </div>
            </motion.div>

            {/* Bottom Right Image */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute right-2 bottom-12 z-30 h-[140px] w-[200px] -rotate-3 overflow-hidden rounded-3xl bg-white/80 p-2 shadow-xl shadow-orange-100/50 backdrop-blur-md transition-all duration-500 hover:z-40 hover:scale-105 hover:rotate-0 md:right-8 md:bottom-20 md:h-[180px] md:w-[260px]"
            >
              <div className="h-full w-full overflow-hidden rounded-2xl">
                <Image
                  src="/images/bg-ตลาดโอโซนวัน4.png"
                  alt="Concert"
                  className="h-full w-full object-cover"
                  width={200}
                  height={200}
                />
              </div>
            </motion.div>

            <div className="absolute bottom-10 left-10 -z-10 grid grid-cols-4 gap-2 opacity-20">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-orange-600"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
