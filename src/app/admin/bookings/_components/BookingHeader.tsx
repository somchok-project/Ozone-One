import { CalendarCheck } from "lucide-react";

export function BookingHeader() {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                <CalendarCheck className="h-4 w-4" />
                จัดการการจอง
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">รายการจองบูธ</h1>
            <p className="text-slate-500 text-sm">ตรวจสอบสถานะและประวัติการเช่าบูธทั้งหมดในตลาด</p>
        </div>
    );
}
