import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { api } from "@/trpc/server";

export default async function FeaturedBooths() {
  let booths: {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    dimension: string;
    images: { id: string; path: string; booth_id: string }[];
    _count: { bookings: number; reviews: number };
  }[] = [];

  try {
    booths = await api.booth.getAll();
  } catch {
    booths = [];
  }

  const featuredBooths = booths.slice(0, 6);

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
          href="/customer"
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
          const firstImage = booth.images[0]?.path ?? "/placeholder-image.jpg";
          const secondImage = booth.images[1]?.path ?? firstImage;
          const hasMultipleImages = booth.images.length > 1;

          return (
            <div
              key={booth.id}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50"
            >
              {/* --- Image Area --- */}
              <div className="relative h-72 w-full overflow-hidden bg-gray-100">
                <div
                  className={`absolute inset-0 h-full w-full transition-transform duration-700 ease-in-out ${hasMultipleImages ? "group-hover:scale-110" : ""}`}
                >
                  <img
                    src={secondImage}
                    alt={booth.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className={`absolute inset-0 h-full w-full transition-all duration-500 ${hasMultipleImages ? "group-hover:opacity-0" : "group-hover:scale-110"}`}
                >
                  <img
                    src={firstImage}
                    alt={booth.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-5 right-5 z-10">
                  <span className="inline-flex items-center rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase shadow-sm backdrop-blur-md border border-green-200/30 bg-green-500/10 text-green-600">
                    <span className="mr-2 block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span>
                    ว่าง
                  </span>
                </div>
              </div>

              {/* --- Content Area --- */}
              <div className="flex flex-1 flex-col p-8">
                <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                    <Store size={14} /> {booth.dimension}
                  </span>
                </div>

                <h3 className="mb-6 line-clamp-1 text-2xl font-bold text-gray-900">
                  {booth.name}
                </h3>

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

                  <Link
                    href={`/customer/booths/${booth.id}`}
                    className="group/btn relative overflow-hidden rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      จองเลย{" "}
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover/btn:translate-x-1"
                      />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Footer */}
      <div className="mt-12 text-center sm:hidden">
        <Link
          href="/customer"
          className="inline-flex items-center gap-2 border-b-2 border-orange-600 pb-1 font-medium text-orange-600"
        >
          ดูพื้นที่ทั้งหมด <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
