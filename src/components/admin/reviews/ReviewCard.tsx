"use client";

import { Star } from "lucide-react";

interface ReviewCardProps {
  review: {
    id: string;
    rating: any; // รองรับ Decimal จาก Prisma
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
  const isMarket = review.type === "MARKET";

  return (
    <div className="group flex flex-col gap-3 py-5 transition-all first:pt-2 last:pb-2 border-b border-slate-50 last:border-none">
      {/* Header: Badge + Booth Name + Rating */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isMarket ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
            }`}
          >
            {isMarket ? "ตลาด" : "บูธ"}
          </span>
          <span className="text-sm font-bold text-slate-700">
            {review.booth.name}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-amber-700">
            {Number(review.rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Content: Comment */}
      <div className="flex-1">
        <p className="text-[14px] leading-relaxed text-slate-500 group-hover:text-slate-600 italic">
          {review.comment ? `"${review.comment}"` : "ไม่มีข้อความความคิดเห็น"}
        </p>
      </div>

      {/* Footer: User Info */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {review.user.name ?? review.user.email.split("@")[0]}
        </span>
      </div>
    </div>
  );
}