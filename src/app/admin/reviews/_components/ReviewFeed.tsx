"use client";

import { Star, MessageSquare, User, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatThaiDate } from "@/lib/utils/format";
import { Pagination } from "@/components/admin/Pagination";
import { getLabelReviewType } from "@/lib/utils/label";
interface ReviewFeedProps {
    reviews: any[];
    totalPages: number;
    currentPage: number;
}

export default function ReviewFeed({ reviews, totalPages, currentPage }: ReviewFeedProps) {
    return (
        <div className="space-y-6">
            {reviews.map((review) => {
                return (
                    <Card
                        key={review.id}
                        className="group overflow-hidden border-none bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)]"
                    >
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                                {/* Left: User Attribution - ปรับให้ดูเป็น Sidebar เล็กๆ ที่สะอาดตา */}
                                <div className="flex items-center gap-3 bg-slate-50/50 px-6 py-4 sm:w-56 sm:flex-col sm:items-start sm:justify-start sm:gap-4 sm:py-8">
                                    <Avatar className="h-10 w-10 ring-2 ring-white sm:h-12 sm:w-12">
                                        <AvatarImage src={review.user.image || ""} />
                                        <AvatarFallback className="bg-orange-100 text-orange-600">
                                            <User className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate text-sm font-black text-slate-800">
                                            {review.user.name || "Anonymous"}
                                        </span>
                                        <span className="truncate text-[11px] font-medium text-slate-400">
                                            {review.user.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Main Content */}
                                <div className="relative flex-1 p-6 sm:p-8">
                                    {/* Rating Floating Badge */}
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-600 ring-1 ring-amber-100">
                                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                                {Number(review.rating).toFixed(1)}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatThaiDate(review.created_at)}
                                            </div>
                                        </div>

                                        <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-tighter ring-1 ${
                                            review.type === "MARKET" 
                                            ? "bg-blue-50 text-blue-600 ring-blue-100" 
                                            : "bg-orange-50 text-orange-600 ring-orange-100"
                                        }`}>
                                            {getLabelReviewType(review)}
                                        </span>
                                    </div>

                                    {/* Target Booth Info */}
                                    <div className="mb-4 flex items-center gap-2 text-slate-700">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-sm font-bold">{review.booth?.name}</span>
                                    </div>

                                    {/* Comment Quote */}
                                    <div className="relative">
                                        <p className="relative z-10 text-[15px] leading-relaxed text-slate-600 italic">
                                            {review.comment ? (
                                                `"${review.comment}"`
                                            ) : (
                                                <span className="text-slate-300">ลูกค้าไม่ได้ระบุความคิดเห็น...</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Empty State */}
            {reviews.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-100 bg-white py-24 text-center shadow-sm">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-200">
                        <MessageSquare className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">ไม่พบรีวิวในหน้านี้</h3>
                    <p className="mt-2 text-sm text-slate-400">ลองรีเซ็ตตัวกรอง หรือค้นหาด้วยคำอื่นดูนะครับ</p>
                </div>
            )}

            {/* Pagination Container */}
            {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                    <div className="rounded-2xl bg-white p-2 shadow-sm border border-slate-100">
                        <Pagination totalPages={totalPages} currentPage={currentPage} />
                    </div>
                </div>
            )}
        </div>
    );
}