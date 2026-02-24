"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import ReviewCard from "@/components/admin/reviews/ReviewCard";
import { Pagination } from "@/components/admin/Pagination";

interface ReviewsSectionProps {
  recentReviews: any[];
  totalReviewPages: number;
  currentReviewPage: number;
}

export default function ReviewsSection({ recentReviews, totalReviewPages, currentReviewPage }: ReviewsSectionProps) {
  return (
    <Card className="border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-bold text-slate-800">รีวิวล่าสุด</CardTitle>
        </div>
        <Link 
          href="/admin/reviews" 
          className="text-xs font-semibold text-slate-400 transition-colors hover:text-orange-600"
        >
          ดูทั้งหมด
        </Link>
      </CardHeader>
      
      <CardContent>
        <div className="divide-y divide-slate-50">
          {recentReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {recentReviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-slate-50 p-3">
                <MessageSquare className="h-6 w-6 text-slate-200" />
              </div>
              <p className="text-sm font-medium text-slate-400">ยังไม่มีข้อมูลรีวิวในขณะนี้</p>
            </div>
          )}
        </div>
        
        {totalReviewPages > 1 && (
          <div className="pt-4 border-t border-slate-50 mt-4">
            <Pagination 
              totalPages={totalReviewPages} 
              currentPage={currentReviewPage} 
              pageParamName="reviewPage" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}