import { Card, CardContent } from "@/components/ui/card";
import type { StatCardProps } from "@/interface/StatCardProps";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  // เลือก Icon ตามประเภทการเปลี่ยนแปลง
  const ChangeIcon = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
  }[changeType];

  const changeColors = {
    positive: "text-emerald-600",
    negative: "text-rose-600",
    neutral: "text-slate-400",
  };

  return (
    <Card className="overflow-hidden border-slate-200/60 shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            {/* Left side: Icon with subtle background */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-200/50">
              {icon}
            </div>
            
            {/* Right side: Badge-style status */}
            <div className={`flex items-center gap-1 text-[13px] font-medium ${changeColors[changeType]}`}>
              <ChangeIcon className="h-3.5 w-3.5" />
              <span>{change}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                {value}
              </h3>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}