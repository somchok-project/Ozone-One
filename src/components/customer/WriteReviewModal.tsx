"use client";

import { useState } from "react";
import { Star, X, Loader2, MessageSquare } from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface WriteReviewModalProps {
  boothId: string;
  boothName: string;
  onClose: () => void;
}

export default function WriteReviewModal({
  boothId,
  boothName,
  onClose,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewType, setReviewType] = useState<"BOOTH" | "MARKET">("BOOTH");
  const router = useRouter();

  const { mutate, isPending, isSuccess, isError, error } =
    api.review.create.useMutation({
      onSuccess: () => {
        router.refresh();
        setTimeout(onClose, 1500);
      },
    });

  function handleSubmit() {
    if (rating === 0) return;
    mutate({
      rating,
      comment: comment.trim() || undefined,
      type: reviewType,
      booth_id: reviewType === "BOOTH" ? boothId : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">เขียนรีวิว</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {isSuccess ? (
            <div className="flex flex-col items-center py-8">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <MessageSquare size={30} className="text-green-500" />
              </div>
              <p className="font-bold text-gray-900">ขอบคุณสำหรับรีวิว! 🎉</p>
              <p className="mt-1 text-sm text-gray-500">รีวิวของคุณถูกบันทึกแล้ว</p>
            </div>
          ) : (
            <>
              {/* Review type toggle */}
              <div className="mb-5 flex rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setReviewType("BOOTH")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    reviewType === "BOOTH"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  รีวิวบูธ
                </button>
                <button
                  onClick={() => setReviewType("MARKET")}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    reviewType === "MARKET"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  รีวิวตลาด
                </button>
              </div>

              {/* Booth name */}
              <p className="mb-4 text-sm text-gray-500">
                {reviewType === "BOOTH" ? (
                  <>
                    รีวิวสำหรับ:{" "}
                    <span className="font-semibold text-gray-800">{boothName}</span>
                  </>
                ) : (
                  "รีวิวภาพรวมของตลาด Ozone One"
                )}
              </p>

              {/* Star rating */}
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  คะแนน <span className="text-red-400">*</span>
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={32}
                        className={
                          star <= (hovered || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }
                        fill={
                          star <= (hovered || rating) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  ความคิดเห็น (ไม่บังคับ)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="เล่าประสบการณ์ของคุณ..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {isError && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                  {(error as any)?.message ?? "เกิดข้อผิดพลาด"}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isPending}
                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    กำลังบันทึก...
                  </span>
                ) : (
                  "ส่งรีวิว"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
