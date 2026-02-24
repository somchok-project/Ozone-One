"use client";

import { Star } from "lucide-react";
import { SearchInput } from "@/components/admin/SearchInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FilterSelect, type FilterSelectOption } from "@/components/ui/filter-select";

export default function ReviewFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const ratingFilter = searchParams.get("rating") || "all";

    const ratingOptions: FilterSelectOption[] = [
        { value: "all", label: "รีวิวทั้งหมด", shortLabel: "รีวิวทั้งหมด" },
        { value: "5", label: "5 ดาว (ดีเยี่ยม)", shortLabel: "5", icon: <Star className="h-4 w-4 fill-current text-current" /> },
        { value: "4", label: "4 ดาว (ดีมาก)", shortLabel: "4", icon: <Star className="h-4 w-4 fill-current text-current" /> },
        { value: "3", label: "3 ดาว (ปานกลาง)", shortLabel: "3", icon: <Star className="h-4 w-4 fill-current text-current" /> },
        { value: "2", label: "2 ดาว (ควรปรับปรุง)", shortLabel: "2", icon: <Star className="h-4 w-4 fill-current text-current" /> },
        { value: "1", label: "1 ดาว (ต้องแก้ไข)", shortLabel: "1", icon: <Star className="h-4 w-4 fill-current text-current" /> },
    ];

    const handleRatingChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set("rating", value);
        } else {
            params.delete("rating");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                {/* Search Input Container */}
                <div className="relative flex-1 group">
                    <SearchInput 
                        placeholder="ค้นหาจากชื่อ, อีเมล, บูธ หรือเนื้อหา..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-orange-100 bg-white focus:border-orange-500 focus:ring-orange-500/20 transition-all shadow-sm"
                    />
                </div>

                {/* Dropdown Filter */}
                <FilterSelect
                    value={ratingFilter}
                    onChange={handleRatingChange}
                    options={ratingOptions}
                    placeholder="ตัวกรองคะแนน"
                    dropdownTitle="เลือกระดับคะแนน"
                />
            </div>

            {/* Active Filter Chips (Optional - เพิ่มเพื่อ UX ที่ดีขึ้น) */}
            {ratingFilter !== "all" && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mt-4 flex items-center gap-2"
                >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">กำลังแสดง:</span>
                    <button 
                        onClick={() => handleRatingChange("all")}
                        className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600 hover:bg-orange-200 transition-colors"
                    >
                        {ratingFilter} ดาว
                        <span className="text-[16px] leading-none">&times;</span>
                    </button>
                </motion.div>
            )}
        </div>
    );
}