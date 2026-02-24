"use client";

import { Star } from "lucide-react";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    type: string;
    user: {
      name: string | null;
      email: string;
    };
    booth: {
      name: string;
    };
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="group flex items-start justify-between py-5 transition-all first:pt-2 last:pb-2">
      <div className="flex-1 pr-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              review.type === "MARKET" ? "bg-blue-50 text-blue-600" : "bg-orange-100 text-orange-500"
            }`}
          >
            {review.type}
          </span>
          <span className="text-sm font-bold text-slate-700">{review.booth.name}</span>
        </div>

        <p className="text-[14px] leading-relaxed text-slate-500 group-hover:text-slate-700">
          {review.comment ? `"${review.comment}"` : "ไม่มีข้อความความคิดเห็น"}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-slate-200" /> {/* Placeholder สำหรับ Avatar */}
          <span className="text-xs font-medium text-slate-400">
            {review.user.name ?? review.user.email.split("@")[0]}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-amber-700">
            {Number(review.rating).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
