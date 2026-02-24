"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export function SearchInput({ placeholder, className }: { placeholder: string; className?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }
            // เพิ่ม scroll: false เพื่อไม่ให้หน้าจอเด้งขึ้นบนสุดเวลาพิมพ์
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }, 400); // ปรับ debounce เป็น 400ms เพื่อความลื่นไหล

        return () => clearTimeout(delayDebounceFn);
    }, [query, pathname, searchParams, router]);

    return (
        <div className="relative group w-full">
            {/* Search Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className={`h-4 w-4 ${query ? 'text-orange-500' : 'text-slate-400 group-focus-within:text-orange-500'}`} />
            </div>

            {/* Input Field */}
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`h-[46px] w-full rounded-2xl border-slate-200 bg-white pl-11 pr-10 text-sm transition-all duration-300 
                           placeholder:text-slate-400
                           hover:border-orange-200 hover:bg-orange-50/10
                           focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus-visible:ring-0
                           shadow-sm ${className || ''}`}
            />

            {/* Clear Button (ปรากฏเมื่อมีข้อความ) */}
            {query && (
                <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full 
                               bg-slate-100 text-slate-400 transition-all hover:bg-orange-100 hover:text-orange-600"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}