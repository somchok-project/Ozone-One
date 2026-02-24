"use client";

import { DollarSign, CalendarCheck, CheckCircle2, Users } from "lucide-react";
import StatCard from "@/components/ui/statcard";
import { formatCurrency } from "@/lib/utils/format";

interface StatsSectionProps {
  revenueThisMonth: number;
  revenueChange: string;
  revenueChangeType: "positive" | "negative" | "neutral";
  totalBookingsCount: number;
  availableBoothsCount: number;
  totalCustomers: number;
}

export default function StatsSection({
  revenueThisMonth,
  revenueChange,
  revenueChangeType,
  totalBookingsCount,
  availableBoothsCount,
  totalCustomers,
}: StatsSectionProps) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="รายได้รวมเดือนนี้"
        value={formatCurrency(revenueThisMonth)}
        change={revenueChange}
        changeType={revenueChangeType}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="การจองทั้งหมด"
        value={totalBookingsCount.toString()}
        change="รายการทั้งหมด"
        changeType="neutral"
        icon={<CalendarCheck className="h-5 w-5" />}
      />
      <StatCard
        title="บูธที่ว่างตอนนี้"
        value={availableBoothsCount.toString()}
        change="พร้อมให้เช่า"
        changeType="positive"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <StatCard
        title="ลูกค้าในระบบ"
        value={totalCustomers.toString()}
        change="บัญชีทั้งหมด"
        changeType="neutral"
        icon={<Users className="h-5 w-5" />}
      />
    </div>
  );
}
