import Link from "next/link";
import { getLabelStatus } from "@/lib/utils/label";
import { SearchInput } from "@/components/admin/SearchInput";

interface BookingFiltersProps {
    query: string;
    statusFilter: string;
}

export function BookingFilters({ query, statusFilter }: BookingFiltersProps) {
    return (
        <div className="flex flex-col gap-6">
            {/* Filter Pills */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto w-fit">
                {['all', 'SUCCESS', 'PENDING', 'CANCEL'].map((status) => (
                    <Link 
                        key={status}
                        href={`/admin/bookings?${new URLSearchParams({ ...(query ? { q: query } : {}), status }).toString()}`}
                    >
                        <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            statusFilter === status 
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                            : 'text-slate-500 hover:text-orange-500'
                        }`}>
                            {status === 'all' ? 'ทั้งหมด' : getLabelStatus(status)}
                        </button>
                    </Link>
                ))}
            </div>

            {/* Search & Statistics Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 w-full md:w-[400px]">
                    <SearchInput placeholder="ค้นหาชื่อลูกค้า, อีเมล, หรือชื่อบูธ..." />
                </div>
            </div>
        </div>
    );
}
