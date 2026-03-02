"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Map,
  X,
  Store,
  Star,
  Maximize2,
  ArrowRight,
} from "lucide-react";
import { type Booth, type Zone } from "@/types";
import Image from "next/image";
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select";

interface BoothsClientProps {
  booths: Booth[];
  zones: Zone[];
  initialParams: {
    zone?: string;
    status?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
  };
}

export default function BoothsClient({
  booths,
  zones,
  initialParams,
}: BoothsClientProps) {
  const [searchText, setSearchText] = useState(initialParams.q ?? "");
  const [selectedZone, setSelectedZone] = useState(initialParams.zone ?? "all");
  const [priceRange, setPriceRange] = useState("all");

  const zoneOptions: FilterSelectOption[] = useMemo(
    () => [
      { value: "all", label: "ทุกโซน", shortLabel: "โซน" },
      ...zones.map((z) => ({
        value: z.id,
        label: z.name,
        icon: z.color_code ? (
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: z.color_code }}
          />
        ) : undefined,
      })),
    ],
    [zones],
  );

  const priceOptions: FilterSelectOption[] = [
    { value: "all", label: "ทุกราคา", shortLabel: "ราคา" },
    { value: "0-1000", label: "ต่ำกว่า 1,000฿", shortLabel: "<1k" },
    { value: "1000-3000", label: "1,000฿ - 3,000฿", shortLabel: "1k-3k" },
    { value: "3000-5000", label: "3,000฿ - 5,000฿", shortLabel: "3k-5k" },
    { value: "5000-up", label: "มากกว่า 5,000฿", shortLabel: "5k+" },
  ];

  const filtered = useMemo(() => {
    return booths.filter((booth) => {
      const matchZone =
        selectedZone === "all" || booth.zone?.id === selectedZone;

      let matchPrice = true;
      if (priceRange !== "all") {
        const parts = priceRange.split("-");
        const min = Number(parts[0]);
        const max = parts[1] === "up" ? Infinity : Number(parts[1]);

        if (!isNaN(min) && !isNaN(max)) {
          matchPrice = booth.price >= min && booth.price <= max;
        } else if (!isNaN(min)) {
          matchPrice = booth.price >= min;
        }
      }

      const matchSearch =
        !searchText ||
        booth.name.toLowerCase().includes(searchText.toLowerCase());

      return matchZone && matchPrice && matchSearch;
    });
  }, [booths, selectedZone, priceRange, searchText]);

  function avgRating(booth: Booth) {
    if (!booth.reviews || booth.reviews.length === 0) return null;
    const sum = booth.reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    return (sum / booth.reviews.length).toFixed(1);
  }

  function clearFilters() {
    setSearchText("");
    setSelectedZone("all");
    setPriceRange("all");
  }

  return (
    <div className="space-y-8">
      {/* 1. Minimal Header & Control Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Title */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Bar */}
          <div className="group relative sm:min-w-[500px]">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orange-500" />
            <input
              type="text"
              placeholder="ค้นหาชื่อบูธ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-2xl border-none bg-white py-2.5 pr-10 pl-10 text-sm shadow-sm ring-1 ring-gray-200 transition-all outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <FilterSelect
              value={selectedZone}
              onChange={setSelectedZone}
              options={zoneOptions}
              placeholder="โซน"
            />
            <FilterSelect
              value={priceRange}
              onChange={setPriceRange}
              options={priceOptions}
              placeholder="ราคา"
            />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
            {filtered.length} รายการ
          </span>
          <Link
            href="/customer/map"
            className="ml-2 inline-flex h-[42px] items-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">แผนผัง 3D</span>
          </Link>
        </div>
      </div>

      {/* 2. Grid Display */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/50 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <Store className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            ไม่พบพื้นที่ที่ค้นหา
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือล้างตัวกรอง
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 rounded-full bg-orange-50 px-6 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((booth) => {
            const img =
              booth.images?.[0]?.path ??
              "https://images.unsplash.com/photo-1543087611-0367ed21aac4?q=80&w=800";
            const rating = avgRating(booth);
            const reviewCount = booth._count?.reviews ?? 0;

            return (
              <Link
                key={booth.id}
                href={`/customer/booths/${booth.id}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-xl hover:ring-transparent"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
                  <Image
                    src={img}
                    alt={booth.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    width={400}
                    height={300}
                  />

                  {/* Floating Overlay Top */}
                  <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
                    {/* Booking status badge */}
                    {booth.isCurrentlyBooked ? (
                      <span className="flex flex-col rounded-xl bg-amber-500/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
                        <span className="text-[11px] font-bold leading-tight text-white">
                          วันนี้ถูกจองแล้ว
                        </span>
                        <span className="text-[9px] font-medium leading-tight text-amber-100">
                          วันอื่นอาจว่าง • กดดูได้เลย
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
                        ว่างอยู่
                      </span>
                    )}

                    {/* Zone Badge */}
                    {booth.zone && (
                      <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: booth.zone.color_code ?? "#e5e7eb",
                          }}
                        />
                        {booth.zone.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between px-1 pt-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 font-semibold text-gray-900 transition-colors group-hover:text-orange-600">
                        {booth.name}
                      </h3>
                      {rating && (
                        <div className="flex shrink-0 items-center gap-1 text-sm font-medium">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Maximize2 className="h-3.5 w-3.5 text-gray-400" />
                        {booth.dimension}
                      </span>
                      {reviewCount > 0 && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span>{reviewCount} รีวิว</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-xl font-bold tracking-tight text-gray-900">
                        ฿{booth.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">/วัน</span>
                    </div>

                    {/* Hover Action Button */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all group-hover:bg-orange-50 group-hover:text-orange-600">
                      <ArrowRight className="h-4 w-4 -rotate-45 transition-transform group-hover:rotate-0" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
