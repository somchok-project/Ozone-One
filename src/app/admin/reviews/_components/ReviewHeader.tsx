"use client";

import { MessageSquare } from "lucide-react";

interface ReviewHeaderProps {
    totalCount: number;
}

export default function ReviewHeader({ totalCount }: ReviewHeaderProps) {
    return (
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
                <div className="mb-2 flex items-center gap-2 text-orange-600">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Review Management</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900">รีวิวจากผู้เช่า</h1>
                <p className="mt-2 text-slate-500">จัดการและตรวจสอบความคิดเห็นทั้งหมด {totalCount} รายการ</p>
            </div>
        </div>
    );
}
