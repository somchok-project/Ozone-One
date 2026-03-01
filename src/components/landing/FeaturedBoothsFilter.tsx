"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select";
import { Layers } from "lucide-react";

interface FeaturedBoothsFilterProps {
  zones: {
    id: string;
    name: string;
    color_code: string | null;
  }[];
}

export default function FeaturedBoothsFilter({
  zones,
}: FeaturedBoothsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentZone = searchParams.get("zone") ?? "all";

  const zoneOptions: FilterSelectOption[] = [
    { label: "ทุกโซน", value: "all", icon: <Layers size={14} /> },
    ...zones.map((zone) => ({
      label: zone.name,
      value: zone.id,
      icon: zone.color_code ? (
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: zone.color_code }}
        />
      ) : undefined,
    })),
  ];

  const handleZoneChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("zone");
    } else {
      params.set("zone", value);
    }
    // Scroll to section after filtering if needed, or just push
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <FilterSelect
      value={currentZone}
      onChange={handleZoneChange}
      options={zoneOptions}
      placeholder="เลือกโซนที่ต้องการ"
      dropdownTitle="เลือกโซน"
      icon={<Layers className="h-4 w-4" />}
    />
  );
}
