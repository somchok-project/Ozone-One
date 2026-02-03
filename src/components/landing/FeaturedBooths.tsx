import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";
const allBooths = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "โซน A - หน้าเวที (A01)",
    price: 3500.0,
    is_available: true,
    type: "BOOKING" as const, // BoothType enum
    latitude: "13.75633000",
    longitude: "100.50177000",
    user_id: "550e8400-e29b-41d4-a716-446655440010",
    images: [
      {
        id: "img-1",
        path: "/images/booths/booth-a01-1.jpg",
        booth_id: "550e8400-e29b-41d4-a716-446655440000",
      },
      {
        id: "img-2",
        path: "/images/booths/booth-a01-2.jpg",
        booth_id: "550e8400-e29b-41d4-a716-446655440000",
      },
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "โซน B - ถนนอาหาร (B04)",
    price: 2500.0,
    is_available: false, // ถูกจองแล้ว - จะไม่แสดง
    type: "BOOKING" as const,
    latitude: "13.75640000",
    longitude: "100.50180000",
    user_id: "550e8400-e29b-41d4-a716-446655440011",
    images: [
      {
        id: "img-3",
        path: "/images/booths/booth-b04-1.jpg",
        booth_id: "550e8400-e29b-41d4-a716-446655440001",
      },
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "โซน C - แฟชั่น (C12)",
    price: 2000.0,
    is_available: true,
    type: "BOOKING" as const,
    latitude: "13.75650000",
    longitude: "100.50190000",
    user_id: "550e8400-e29b-41d4-a716-446655440012",
    images: [
      {
        id: "img-4",
        path: "/images/booths/booth-c12-1.jpg",
        booth_id: "550e8400-e29b-41d4-a716-446655440002",
      },
      {
        id: "img-5",
        path: "/images/booths/booth-c12-2.jpg",
        booth_id: "550e8400-e29b-41d4-a716-446655440002",
      },
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "โซน D - พื้นที่ฟรี (D01)",
    price: 0,
    is_available: true,
    type: "FREE" as const, // พื้นที่ฟรี
    latitude: "13.75660000",
    longitude: "100.50200000",
    user_id: "550e8400-e29b-41d4-a716-446655440013",
    images: [
      {
        id: "img-6",
        path: "/images/booths/booth-d01-1.jpg",
        booth_id: "550e8400-e29b-41d4-a716-446655440003",
      },
    ],
  },
];

// Filter เฉพาะบูธที่ว่าง (is_available: true)
const featuredBooths = allBooths.filter((booth) => booth.is_available);

export default function FeaturedBooths() {
  return (
    <section
      id="booths"
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* --- Header Section --- */}
      <div className="mb-16 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            พื้นที่<span className="text-orange-600 italic">แนะนำ</span>
          </h2>
          <p className="max-w-xl text-lg font-light text-gray-500">
            คัดสรรทำเลค้าขายที่ดีที่สุด
            พร้อมยกระดับแบรนด์ของคุณสู่สายตาลูกค้าจำนวนมาก
          </p>
        </div>
        <Link
          href="/booths"
          className="group hidden items-center gap-2 border-b-2 border-transparent pb-1 font-medium text-gray-900 transition-all hover:border-orange-600 hover:text-orange-600 sm:flex"
        >
          ดูพื้นที่ทั้งหมด
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* --- Cards Grid --- */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {featuredBooths.map((booth) => {
          // Logic การดึงรูปภาพจาก Array ตาม Prisma Model (Image.path)
          const firstImage = booth.images[0]?.path ?? "/placeholder-image.jpg"; // Fallback if empty
          const secondImage = booth.images[1]?.path ?? firstImage;
          const hasMultipleImages = booth.images.length > 1;

          return (
            <div
              key={booth.id}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50"
            >
              {/* --- Image Area --- */}
              <div className="relative h-72 w-full overflow-hidden bg-gray-100">
                {/* รูปที่ 2 (Background Layer) */}
                <div
                  className={`absolute inset-0 h-full w-full transition-transform duration-700 ease-in-out ${hasMultipleImages ? "group-hover:scale-110" : ""}`}
                >
                  <img
                    src={secondImage}
                    alt={booth.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* รูปที่ 1 (Foreground Layer) */}
                <div
                  className={`absolute inset-0 h-full w-full transition-all duration-500 ${hasMultipleImages ? "group-hover:opacity-0" : "group-hover:scale-110"}`}
                >
                  <img
                    src={firstImage}
                    alt={booth.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Status Badge using 'is_available' */}
                <div className="absolute top-5 right-5 z-10">
                  <span
                    className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase shadow-sm backdrop-blur-md ${
                      booth.is_available
                        ? "border border-green-200/30 bg-green-500/10 text-green-600"
                        : "border border-gray-200/30 bg-gray-900/5 text-gray-500"
                    }`}
                  >
                    {booth.is_available ? (
                      <>
                        <span className="mr-2 block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span>
                        ว่าง
                      </>
                    ) : (
                      "จองแล้ว"
                    )}
                  </span>
                </div>
              </div>

              {/* --- Content Area --- */}
              <div className="flex flex-1 flex-col p-8">
                {/* Type & Lat/Long Info */}
                <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                    <Store size={14} /> {booth.type}
                  </span>
                  {/* แสดง Location แบบย่อๆ (หรือจะใช้ Lat/Long จริงก็ได้ แต่ใน UI ผู้ใช้มักไม่อ่านพิกัด) */}
                  <span
                    className="flex items-center gap-1 truncate text-xs text-gray-400"
                    title={`Lat: ${booth.latitude}, Long: ${booth.longitude}`}
                  >
                    <MapPin size={14} />
                    {/* แปลงพิกัดเป็นข้อความสั้นๆ หรือใช้ชื่อโซนจาก Name */}
                    โซนแผนที่
                  </span>
                </div>

                {/* Name */}
                <h3 className="mb-6 line-clamp-1 text-2xl font-bold text-gray-900">
                  {booth.name}
                </h3>

                {/* Price & Action */}
                <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-6">
                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wider text-gray-400 uppercase">
                      ราคาต่อวัน
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        ฿{booth.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {booth.is_available ? (
                    <button className="group/btn relative overflow-hidden rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200">
                      <span className="relative z-10 flex items-center gap-2">
                        จองเลย{" "}
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover/btn:translate-x-1"
                        />
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="cursor-not-allowed rounded-full bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-400"
                    >
                      เต็มแล้ว
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Footer */}
      <div className="mt-12 text-center sm:hidden">
        <Link
          href="/booths"
          className="inline-flex items-center gap-2 border-b-2 border-orange-600 pb-1 font-medium text-orange-600"
        >
          ดูพื้นที่ทั้งหมด <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
