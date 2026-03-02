import Link from "next/link";
import { getBookingStatusLabel } from "@/lib/utils/bookingStatus";
import { SearchInput } from "@/components/admin/SearchInput";

interface BookingFiltersProps {
    query: string;
    statusFilter: string;
}

export function BookingFilters({ query, statusFilter }: BookingFiltersProps) {
    const statuses = ["all", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

    return (
        <div className="flex flex-col gap-4 items-end">
            {/* Search */}
            <div className="w-full md:w-100">
                <SearchInput placeholder="ค้นหาชื่อลูกค้า, อีเมล, หรือชื่อบูธ..." />
            </div>
            {/* Filter Pills */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto w-fit">
                {statuses.map((status) => (
                    <Link
                        key={status}
                        href={`/admin/bookings?${new URLSearchParams({ ...(query ? { q: query } : {}), status }).toString()}`}
                    >
                        <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            statusFilter === status
                                ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                                : "text-slate-500 hover:text-orange-500"
                        }`}>
                            {status === "all" ? "ทั้งหมด" : getBookingStatusLabel(status)}
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
}
