"use client";

import { Star, User, Calendar, MapPin, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  type: string;
  created_at: Date;
  user: { name: string | null; image: string | null };
  booth: { name: string } | null;
}

interface CustomerReviewFeedProps {
  reviews: ReviewData[];
  totalPages: number;
  currentPage: number;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CustomerReviewFeed({
  reviews,
  totalPages,
  currentPage,
}: CustomerReviewFeedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-300">
          <MessageSquare size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">ยังไม่มีรีวิว</h3>
        <p className="mt-1 text-sm text-gray-400">ลองเปลี่ยนตัวกรองดู</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
        >
          <div className="p-6">
            {/* Top row: User + Rating */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {review.user.image ? (
                  <img
                    src={review.user.image}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                    <User size={18} />
                  </div>
                )}
                <div>
                  <span className="block text-sm font-bold text-gray-900">
                    {review.user.name || "ผู้ใช้งาน"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} />
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>

              {/* Rating badge */}
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 ring-1 ring-amber-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(review.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }
                  />
                ))}
                <span className="ml-1 text-sm font-bold text-amber-600">
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              {review.booth && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                  <MapPin size={12} />
                  {review.booth.name}
                </span>
              )}
            </div>

            {/* Comment */}
            {review.comment ? (
              <p className="text-[15px] leading-relaxed text-gray-600 italic">
                &ldquo;{review.comment}&rdquo;
              </p>
            ) : (
              <p className="text-sm text-gray-300 italic">
                ไม่ได้ระบุความคิดเห็น
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                currentPage === i + 1
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
