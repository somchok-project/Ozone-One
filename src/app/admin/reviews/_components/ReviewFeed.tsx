"use client";

import { Star, MessageSquare, User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatThaiDate } from "@/lib/utils/format";

import { Pagination } from "@/components/admin/Pagination";

interface ReviewFeedProps {
    reviews: any[];
    totalPages: number;
    currentPage: number;
}

export default function ReviewFeed({ reviews, totalPages, currentPage }: ReviewFeedProps) {
    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <Card
                    key={review.id}
                    className="group border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)]"
                >
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-6 sm:flex-row">
                            {/* Left: User Info */}
                            <div className="flex w-full flex-row items-center gap-4 sm:w-48 sm:flex-col sm:items-start sm:gap-2">
                                <Avatar className="h-12 w-12 sm:h-10 sm:w-10">
                                    <AvatarImage src={review.user.image || ""} />
                                    <AvatarFallback className="bg-slate-100 text-slate-400">
                                        <User className="h-6 w-6 sm:h-5 sm:w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="truncate font-bold text-slate-900">
                                        {review.user.name || "ไม่ระบุชื่อ"}
                                    </span>
                                    <span className="truncate text-xs text-slate-400">
                                        {review.user.email}
                                    </span>
                                </div>
                            </div>

                            {/* Middle: Content */}
                            <div className="flex-1 border-slate-100 sm:border-l sm:pl-8">
                                <div className="mb-3 flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-600">
                                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                        {Number(review.rating).toFixed(1)}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                                        {review.booth?.name}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        {formatThaiDate(review.created_at)}
                                    </div>
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                        {review.type}
                                    </span>
                                </div>

                                <p className="text-[15px] leading-relaxed text-slate-600">
                                    {review.comment ? (
                                        `"${review.comment}"`
                                    ) : (
                                        <span className="italic text-slate-300">
                                            ไม่มีเนื้อหารีวิว
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {reviews.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
                    <div className="mb-4 rounded-full bg-slate-50 p-4">
                        <MessageSquare className="h-10 w-10 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">ไม่พบรีวิวที่คุณค้นหา</h3>
                    <p className="text-slate-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองคะแนน</p>
                </div>
            )}
            {totalPages > 1 && (
                <div className="pt-4 border-t border-slate-100">
                    <Pagination totalPages={totalPages} currentPage={currentPage} />
                </div>
            )}
        </div>
    );
}
