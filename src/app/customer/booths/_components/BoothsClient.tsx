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
} from "lucide-react";
import { type Booth, type Zone } from "@/types";
import Image from "next/image";

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
  const [statusFilter, setStatusFilter] = useState(
    initialParams.status ?? "all",
  );
  const [minPrice, setMinPrice] = useState(initialParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return booths.filter((booth) => {
      const matchZone =
        selectedZone === "all" || booth.zone?.id === selectedZone;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && booth.is_available) ||
        (statusFilter === "unavailable" && !booth.is_available);
      const matchSearch =
        !searchText ||
        booth.name.toLowerCase().includes(searchText.toLowerCase());
      const matchMin = !minPrice || booth.price >= Number(minPrice);
      const matchMax = !maxPrice || booth.price <= Number(maxPrice);
      return matchZone && matchStatus && matchSearch && matchMin && matchMax;
    });
  }, [booths, selectedZone, statusFilter, searchText, minPrice, maxPrice]);

  function avgRating(booth: Booth) {
    if (!booth.reviews || booth.reviews.length === 0) return null;
    const sum = booth.reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    return (sum / booth.reviews.length).toFixed(1);
  }

  function clearFilters() {
    setSearchText("");
    setSelectedZone("all");
    setStatusFilter("all");
    setMinPrice("");
    setMaxPrice("");
  }

  const hasActiveFilters =
    searchText ||
    selectedZone !== "all" ||
    statusFilter !== "all" ||
    minPrice ||
    maxPrice;

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
        <div className="flex gap-3">
          <Link
            href="/customer/map"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
          >
            <Map size={16} />
            แผนผัง 3D
          </Link>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
              showFilters
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50"
            }`}
          >
            <SlidersHorizontal size={16} />
            ตัวกรอง
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="ค้นหาชื่อบูธ..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pr-4 pl-11 text-sm shadow-sm ring-0 transition outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Zone */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                โซน
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedZone("all")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    selectedZone === "all"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                  }`}
                >
                  ทุกโซน
                </button>
                {zones.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      selectedZone === z.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    {z.color_code && (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: z.color_code }}
                      />
                    )}
                    {z.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                สถานะ
              </label>
              <div className="flex gap-2">
                {[
                  { label: "ทั้งหมด", value: "all" },
                  { label: "ว่าง", value: "available" },
                  { label: "เต็ม", value: "unavailable" },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      statusFilter === s.value
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase">
                ราคาต่อวัน (฿)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="ต่ำสุด"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  placeholder="สูงสุด"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  <X size={14} />
                  ล้างตัวกรอง
                </button>
              </div>
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
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        booth.is_available
                          ? "bg-green-500/90 text-white"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {booth.is_available ? (
                        <>
                          <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                          ว่าง
                        </>
                      ) : (
                        "เต็ม"
                      )}
                    </span>
                  </div>
                  {/* Zone chip */}
                  {booth.zone && (
                    <div className="absolute bottom-3 left-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                        style={{
                          backgroundColor: booth.zone.color_code
                            ? `${booth.zone.color_code}33`
                            : "#f97316",
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
