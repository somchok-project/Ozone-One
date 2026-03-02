"use client";

import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterSelect } from "@/components/ui/filter-select";
import type { FilterSelectOption } from "@/components/ui/filter-select";
import { Filter } from "lucide-react";

interface BoothFiltersProps {
    query: string;
    statusFilter: string;
}

const statusOptions: FilterSelectOption[] = [
    { label: "ทั้งหมด", value: "all" },
    { label: "ว่างอยู่", value: "available" },
    { label: "ถูกจองอยู่", value: "occupied" },
    { label: "ปิดชั่วคราว", value: "closed" },
];

export function BoothFilters({ query, statusFilter }: BoothFiltersProps) {
    const router = useRouter();

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("status", value);
        router.push(`/admin/booths?${params.toString()}`);
    };

    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 w-full md:w-[400px]">
                <SearchInput placeholder="ค้นหาชื่อบูธ หรือขนาด..." />
            </div>
            
            <div className="shrink-0">
                <FilterSelect
                    value={statusFilter}
                    onChange={handleStatusChange}
                    options={statusOptions}
                    placeholder="ตัวกรองสถานะ"
                    dropdownTitle="เลือกสถานะ"
                    icon={<Filter className="h-4 w-4" />}
                />
            </div>
        </div>
    );
}
