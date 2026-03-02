"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Layers,
  SlidersHorizontal,
  Store,
  Star,
  Ruler,
  ChevronRight,
  X,
  Map,
  LayoutGrid,
  Banknote,
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
  const [showFilters, setShowFilters] = useState(false);

  const zoneOptions: FilterSelectOption[] = useMemo(
    () => [
      { value: "all", label: "ทุกโซน", shortLabel: "โซน" },
      ...zones.map((z) => ({
        value: z.id,
        label: z.name,
        icon: z.color_code ? (
          <div
            className="h-2 w-2 rounded-full"
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

  const hasActiveFilters =
    searchText || selectedZone !== "all" || priceRange !== "all";

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ค้นหา<span className="text-orange-500">พื้นที่</span>
          </h1>
          <p className="mt-1 text-gray-500">{filtered.length} บูธที่พบ</p>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อบูธ หรือสิ่งที่เกี่ยวข้อง..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pr-4 pl-11 text-sm shadow-sm ring-0 transition outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            value={selectedZone}
            onChange={setSelectedZone}
            options={zoneOptions}
            placeholder="เลือกโซน"
            icon={<LayoutGrid className="h-4 w-4" />}
            dropdownTitle="เลือกตามโซนพื้นที่"
          />

          <FilterSelect
            value={priceRange}
            onChange={setPriceRange}
            options={priceOptions}
            placeholder="ช่วงราคา"
            icon={<Banknote className="h-4 w-4" />}
            dropdownTitle="เลือกตามช่วงราคา"
          />
        </div>{" "}
        <div className="flex gap-3">
          <Link
            href="/customer/map"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
          >
            <Map size={16} />
            แผนผัง 3D
          </Link>
        </div>
      </div>

      {/* Extended filters (Price range removed) */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-orange-100 bg-orange-50/30 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? "กำลังกรองข้อมูลด้วยเงื่อนไขที่คุณเลือก"
                : "คุณยังไม่ได้เลือกตัวกรองเพิ่มเติม"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-red-500 shadow-sm ring-1 ring-red-100 transition-all hover:bg-red-50"
              >
                <X size={16} />
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Store size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-400">
            ไม่พบบูธที่ตรงกับเงื่อนไข
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm font-semibold text-orange-500 hover:underline"
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((booth) => {
            const img =
              booth.images?.[0]?.path ??
              "https://images.unsplash.com/photo-1543087611-0367ed21aac4?q=80&w=800";
            const rating = avgRating(booth);

            return (
              <Link
                key={booth.id}
                href={`/customer/booths/${booth.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <Image
                    src={img}
                    alt={booth.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={500}
                    height={500}
                  />
                  {/* Status badge */}
                  {!booth.is_available && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white">
                        เต็ม
                      </span>
                    </div>
                  )}
                  {/* Zone chip */}
                  {booth.zone && (
                    <div className="absolute top-3 right-3 z-10">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                        style={{
                          backgroundColor: booth.zone.color_code
                            ? `${booth.zone.color_code}33`
                            : "#f9731633",
                          color: booth.zone.color_code ?? "#ea580c",
                          border: `1px solid ${booth.zone.color_code ?? "#f97316"}55`,
                        }}
                      >
                        <Layers size={10} />
                        {booth.zone.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-bold text-gray-900 transition-colors group-hover:text-orange-600">
                      {booth.name}
                    </h3>
                    {rating && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={12} fill="currentColor" />
                        {rating}
                      </span>
                    )}
                  </div>

                  <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Ruler size={11} />
                      {booth.dimension}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{booth._count?.reviews ?? 0} รีวิว</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-orange-600">
                        ฿{booth.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400"> /วัน</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 group-hover:underline">
                      ดูรายละเอียด
                      <ChevronRight size={14} />
                    </span>
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
