"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ReviewsSectionProps {
  recentReviews: any[];
}

export default function ReviewsSection({ recentReviews }: ReviewsSectionProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">รีวิวล่าสุด</CardTitle>
        <Link href="/admin/reviews" className="text-xs font-medium text-orange-600 hover:underline">
          ดูทั้งหมด
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div key={review.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                   <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {review.type}
                  </span>
                  <span className="text-xs font-medium text-orange-600">{review.booth.name}</span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-2 italic">"{review.comment ?? "ไม่มีข้อความ"}"</p>
                <p className="mt-2 text-[11px] text-slate-400">โดย {review.user.name ?? review.user.email}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
                <Star className="h-3 w-3 fill-amber-600" />
                {Number(review.rating).toFixed(1)}
              </div>
            </div>
          ))}
          {recentReviews.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">ยังไม่มีข้อมูลรีวิว</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
