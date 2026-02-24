"use client";

import { Star } from "lucide-react";
import type { ReviewCardProps } from "@/interface/ReviewCardProps";
import { getLabelReviewType } from "@/lib/utils/label";

export default function ReviewCard({ review }: ReviewCardProps) {
  const isMarket = review.type === "MARKET";

  return (
    <div className="group flex flex-col gap-3 py-5 transition-all first:pt-2 last:pb-2 border-b border-slate-50 last:border-none">
      {/* Upper Row: Status & Rating */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Label Badge */}
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isMarket 
                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                : "bg-orange-50 text-orange-600 border border-orange-100"
            }`}
          >
            {getLabelReviewType(review)}
          </span>
          {/* Target Name */}
          <span className="text-sm font-bold text-slate-700">
            {review.booth.name}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 ring-1 ring-slate-200/50">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-700">
            {Number(review.rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Middle Row: Content */}
      <div className="flex-1">
        <p className="text-[14px] leading-relaxed text-slate-500 group-hover:text-slate-600 italic">
          {review.comment ? `"${review.comment}"` : "ไม่มีข้อความความคิดเห็น"}
        </p>
      </div>

      {/* Lower Row: User Attribution */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Subtle Avatar */}
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {review.user.name ?? review.user.email.split("@")[0]}
          </span>
        </div>
        
        {/* Time - Option: สามารถส่ง created_at มาเพิ่มได้ */}
        {/* <span className="text-[10px] text-slate-300">2 ชม. ที่แล้ว</span> */}
      </div>
    </div>
  );
}