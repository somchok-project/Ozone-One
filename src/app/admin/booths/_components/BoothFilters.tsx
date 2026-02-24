import Link from "next/link";
import { SearchInput } from "@/components/admin/SearchInput";

interface BoothFiltersProps {
    query: string;
    statusFilter: string;
}

export function BoothFilters({ query, statusFilter }: BoothFiltersProps) {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
                <SearchInput placeholder="ค้นหาชื่อบูธ หรือขนาด..." />
            </div>
            
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                {[
                    { label: "ทั้งหมด", value: "all" },
                    { label: "ว่าง", value: "available" },
                    { label: "ไม่ว่าง/ถูกจอง", value: "occupied" }
                ].map((opt) => (
                    <Link 
                        key={opt.value}
                        href={`/admin/booths?${new URLSearchParams({ ...(query ? { q: query } : {}), status: opt.value }).toString()}`}
                    >
                        <button className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            statusFilter === opt.value 
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-200' 
                            : 'text-slate-500 hover:text-orange-500'
                        }`}>
                            {opt.label}
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
}
