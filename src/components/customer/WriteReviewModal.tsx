"use client";

import { useState } from "react";
import { Star, X, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
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
        setTimeout(onClose, 2000); // ยืดเวลาออกนิดนึงให้ลูกค้าได้เห็นแอนิเมชันสำเร็จ
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      {/* Modal Container with Entrance Animation */}
      <div className="relative w-full max-w-[420px] animate-in zoom-in-95 fade-in duration-200 overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-orange-900/10">
        
        {/* Close button (Floating) */}
        {!isSuccess && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-600"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}

        <div className="p-6 sm:p-8">
          {isSuccess ? (
            /* ── SUCCESS STATE ── */
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-50 duration-500">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500 ring-4 ring-orange-50/50 shadow-inner">
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <h3 className="mb-2 text-2xl font-black tracking-tight text-gray-900">
                ขอบคุณสำหรับรีวิว! 🎉
              </h3>
              <p className="text-sm font-medium text-gray-500">
                ความคิดเห็นของคุณมีความหมายกับเรามาก
              </p>
            </div>
          ) : (
            /* ── REVIEW FORM ── */
            <div className="flex flex-col">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100">
                  <MessageSquare size={28} strokeWidth={2} />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                  เขียนรีวิว
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  แบ่งปันประสบการณ์ของคุณให้คนอื่นทราบ
                </p>
              </div>

              {/* Review Type Toggle (Pill shape) */}
              <div className="mb-6 flex rounded-2xl bg-gray-50/80 p-1.5 ring-1 ring-gray-200/50">
                <button
                  onClick={() => setReviewType("BOOTH")}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
                    reviewType === "BOOTH"
                      ? "bg-white text-orange-600 shadow-sm ring-1 ring-gray-200/50"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  รีวิวบูธ
                </button>
                <button
                  onClick={() => setReviewType("MARKET")}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
                    reviewType === "MARKET"
                      ? "bg-white text-orange-600 shadow-sm ring-1 ring-gray-200/50"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  ภาพรวมตลาด
                </button>
              </div>

              {/* Target Name */}
              <div className="mb-6 rounded-2xl bg-orange-50/50 p-4 text-center ring-1 ring-orange-100">
                <p className="text-sm font-medium text-orange-900/60">
                  กำลังให้คะแนน
                </p>
                <p className="text-base font-bold text-orange-600">
                  {reviewType === "BOOTH" ? boothName : "ตลาด Ozone One"}
                </p>
              </div>

              {/* Interactive Star Rating (Float Effect) */}
              <div className="mb-6 flex flex-col items-center">
                <p className="mb-3 text-sm font-bold text-gray-700">
                  ให้คะแนนความพึงพอใจ <span className="text-red-500">*</span>
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= (hovered || rating);
                    return (
                      <button
                        key={star}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(star)}
                        className={`cursor-pointer transition-all duration-300 ${
                          isActive
                            ? "scale-110 -translate-y-1 drop-shadow-md" // เอฟเฟกต์ Float เมื่อ Active/Hover
                            : "scale-100 translate-y-0 opacity-40 hover:opacity-80"
                        }`}
                      >
                        <Star
                          size={36}
                          className={`transition-colors duration-300 ${
                            isActive
                              ? "fill-orange-400 text-orange-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="mb-8">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  ความคิดเห็นเพิ่มเติม <span className="text-gray-400 font-medium">(ไม่บังคับ)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="ความประทับใจ, ข้อเสนอแนะ..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border-none bg-gray-50/80 px-4 py-3 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200/60 transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              {/* Error Message */}
              {isError && (
                <div className="mb-6 rounded-2xl bg-red-50 p-3 text-center text-sm font-medium text-red-600 ring-1 ring-red-100">
                  {error?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่"}
                </div>
              )}

              {/* Floating Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isPending}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:shadow-orange-500/50 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-orange-500/30"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <span>ส่งรีวิว</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}