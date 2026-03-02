import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Store, Star, MapPin, Sparkles } from "lucide-react";
import { api } from "@/trpc/server";
import FeaturedBoothsFilter from "./FeaturedBoothsFilter";

interface FeaturedBoothsProps {
  searchParams?: {
    zone?: string;
  };
}

export default async function FeaturedBooths({
  searchParams,
}: FeaturedBoothsProps) {
  const zoneId = searchParams?.zone;

  let booths: Awaited<ReturnType<typeof api.booth.getAll>> = [];
  let zones: Awaited<ReturnType<typeof api.booth.getZones>> = [];

  try {
    [booths, zones] = await Promise.all([
      api.booth.getAll({ zoneId }),
      api.booth.getZones(),
    ]);
  } catch (error) {
    console.error("Failed to fetch featured booths or zones:", error);
  }

  const filteredBooths = booths.slice(0, 6);

  return (
    <section
      id="booths"
      className="relative mx-auto max-w-7xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-50/50 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-orange-50/30 blur-3xl" />

      {/* --- Header Section --- */}
      <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100/50 px-4 py-1.5 text-sm font-semibold text-orange-600">
            <Sparkles size={16} />
            <span>Top Rated Locations</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            พื้นที่<span className="text-orange-600 italic">แนะนำ</span>
          </h2>
          <p className="max-w-xl text-lg font-light text-gray-500">
            คัดสรรทำเลค้าขายที่ดีที่สุด
            พร้อมยกระดับแบรนด์ของคุณสู่สายตาลูกค้าจำนวนมาก
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <FeaturedBoothsFilter zones={zones} />
          <Link
            href="/customer/booths"
            className="group hidden items-center gap-2 rounded-2xl bg-gray-50 px-6 py-3 text-sm font-bold text-gray-900 transition-all hover:bg-orange-600 hover:text-white sm:flex"
          >
            ดูทั้งหมด
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* --- Cards Grid --- */}
      {filteredBooths.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {filteredBooths.map((booth) => {
            const firstImage =
              booth.images[0]?.path ??
              "https://images.unsplash.com/photo-1543087611-0367ed21aac4?q=80&w=800";
            const secondImage = booth.images[1]?.path ?? firstImage;
            const hasMultipleImages = booth.images.length > 1;

            // Calculate average rating
            const ratings = booth.reviews.map((r: { rating: unknown }) =>
              Number(r.rating),
            );
            const avgRating =
              ratings.length > 0
                ? (
                    ratings.reduce((a: number, b: number) => a + b, 0) /
                    ratings.length
                  ).toFixed(1)
                : null;

            return (
              <div
                key={booth.id}
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                {/* --- Image Area --- */}
                <div className="relative h-80 w-full overflow-hidden bg-gray-100">
                  <div
                    className={`absolute inset-0 h-full w-full transition-transform duration-700 ease-in-out ${hasMultipleImages ? "group-hover:scale-110" : ""}`}
                  >
                    <Image
                      src={secondImage}
                      alt={booth.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div
                    className={`absolute inset-0 h-full w-full transition-all duration-500 ${hasMultipleImages ? "group-hover:opacity-0" : "group-hover:scale-110"}`}
                  >
                    <Image
                      src={firstImage}
                      alt={booth.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    {booth.isCurrentlyBooked && booth.is_available ? (
                      <span className="flex flex-col items-start rounded-2xl border border-amber-200/40 bg-amber-500/10 px-3 py-2 shadow-sm backdrop-blur-md">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                          <span className="block h-1.5 w-1.5 rounded-full bg-amber-500" />
                          วันนี้ถูกจองแล้ว
                        </span>
                        <span className="mt-0.5 text-[10px] font-medium text-amber-600/80">
                          วันอื่นอาจว่าง • กดดูก่อนได้
                        </span>
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase shadow-sm backdrop-blur-md ${
                          !booth.is_available
                            ? "border-slate-200/30 bg-slate-500/10 text-slate-500"
                            : "border-green-200/30 bg-green-500/10 text-green-600"
                        }`}
                      >
                        <span
                          className={`mr-2 block h-1.5 w-1.5 rounded-full ${
                            !booth.is_available ? "bg-slate-400" : "animate-pulse bg-green-500"
                          }`}
                        ></span>
                        {!booth.is_available ? "ปิดชั่วคราว" : "ว่างอยู่"}
                      </span>
                    )}
                  </div>

                  {/* Zone Badge */}
                  {booth.zone && (
                    <div className="absolute bottom-6 left-6 z-10">
                      <span
                        className="inline-flex items-center rounded-full bg-white/95 px-4 py-2 text-[11px] font-black tracking-tighter text-gray-900 uppercase shadow-xl backdrop-blur-md transition-transform group-hover:scale-110"
                        style={{
                          borderLeft: `4px solid ${booth.zone.color_code ?? "#orange"}`,
                        }}
                      >
                        <MapPin size={12} className="mr-1.5 text-orange-500" />
                        {booth.zone.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* --- Content Area --- */}
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-4 flex items-center justify-between gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                      <Store size={14} /> {booth.dimension}
                    </span>

                    {avgRating && (
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <Star
                          size={16}
                          className="fill-orange-500 text-orange-500"
                        />
                        {avgRating}
                        <span className="text-[10px] font-medium text-gray-400">
                          ({booth._count.reviews})
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="mb-8 line-clamp-1 text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-orange-600">
                    {booth.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-8">
                    <div>
                      <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        ราคาต่อวัน
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900">
                          ฿{booth.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/customer/booths/${booth.id}`}
                      className={`group/btn relative overflow-hidden rounded-2xl px-8 py-4 text-sm font-black transition-all duration-500 ${
                        !booth.is_available
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : "bg-orange-600 text-white hover:bg-orange-600 hover:shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {!booth.is_available ? "ปิดชั่วคราว" : booth.isCurrentlyBooked ? "จองวันอื่น" : "จองเลย"}
                        <ArrowRight
                          size={18}
                          className="transition-transform duration-500 group-hover/btn:translate-x-1.5"
                        />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 rounded-full bg-gray-50 p-6 text-gray-400">
            <Store size={48} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            ไม่พบพื้นที่ในโซนนี้
          </h3>
          <p className="mt-2 text-gray-500">
            กรุณาลองเลือกโซนอื่น หรือดูพื้นที่ทั้งหมด
          </p>
          <Link
            href="/customer"
            className="mt-8 font-bold text-orange-600 hover:text-orange-700"
          >
            ดูพื้นที่ทั้งหมด
          </Link>
        </div>
      )}

      {/* Mobile Footer */}
      <div className="mt-16 text-center sm:hidden">
        <Link
          href="/customer"
          className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-orange-600"
        >
          ดูพื้นที่ทั้งหมด <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
