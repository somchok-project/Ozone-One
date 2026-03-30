"use client";

import { Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ratings = [
  { value: "all", label: "ทั้งหมด" },
  { value: "5", label: "5 ดาว" },
  { value: "4", label: "4 ดาว" },
  { value: "3", label: "3 ดาว" },
  { value: "2", label: "2 ดาว" },
  { value: "1", label: "1 ดาว" },
];

export default function CustomerReviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ratingFilter = searchParams.get("rating") || "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set("rating", value);
    } else {
      params.delete("rating");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {ratings.map((r) => (
        <button
          key={r.value}
          onClick={() => handleChange(r.value)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            ratingFilter === r.value
              ? "bg-orange-500 text-white shadow-md shadow-orange-200"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          {r.value !== "all" && (
            <Star
              size={14}
              className={
                ratingFilter === r.value
                  ? "fill-white text-white"
                  : "fill-orange-400 text-orange-400"
              }
            />
          )}
          {r.label}
        </button>
      ))}
    </div>
  );
}
