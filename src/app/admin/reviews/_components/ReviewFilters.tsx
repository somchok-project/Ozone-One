"use client";

import Link from "next/link";
import { Filter, Star } from "lucide-react";
import { Button } from "@/components/ui";
import { SearchInput } from "@/components/admin/SearchInput";
import { useSearchParams } from "next/navigation";

export default function ReviewFilters() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const ratingFilter = searchParams.get("rating") || "all";

    return (
        <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                    <SearchInput placeholder="ค้นหาจากชื่อ, อีเมล, บูธ หรือเนื้อหา..." />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Filter className="mr-2 h-4 w-4 text-slate-400" />
                    {["all", "5", "4", "3", "2", "1"].map((r) => (
                        <Link
                            key={r}
                            href={`/admin/reviews?${new URLSearchParams({
                                ...(query ? { q: query } : {}),
                                rating: r,
                            }).toString()}`}
                        >
                            <Button
                                variant={ratingFilter === r ? "primary" : "ghost"}
                                size="sm"
                                className={`h-9 rounded-full px-4 ${
                                    ratingFilter === r
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "bg-white text-slate-600 shadow-sm border border-slate-200"
                                }`}
                            >
                                {r === "all" ? (
                                    "ทั้งหมด"
                                ) : (
                                    <span className="flex items-center gap-1">
                                        {r}{" "}
                                        <Star
                                            className={`h-3 w-3 ${
                                                ratingFilter === r
                                                    ? "fill-white"
                                                    : "fill-amber-400 text-amber-400"
                                            }`}
                                        />
                                    </span>
                                )}
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
