import { CalendarCheck, Clock, CheckCircle2, Flag, XCircle } from "lucide-react";

interface BookingHeaderProps {
    stats: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };
}

export function BookingHeader({ stats }: BookingHeaderProps) {
    const items = [
        { label: "รอดำเนินการ", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "ยืนยันแล้ว", value: stats.confirmed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "เสร็จสิ้น", value: stats.completed, icon: Flag, color: "text-sky-500", bg: "bg-sky-50" },
        { label: "ยกเลิก", value: stats.cancelled, icon: XCircle, color: "text-rose-400", bg: "bg-rose-50" },
    ];

    return (
        <div className="space-y-4">
            <div>
                <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px] mb-1">
                    <CalendarCheck className="h-4 w-4" />
                    จัดการการจอง
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">รายการจองบูธ</h1>
                <p className="text-slate-500 text-sm">ตรวจสอบสถานะและประวัติการเช่าบูธทั้งหมดในตลาด</p>
            </div>
            {/* Mini stat pills */}
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 rounded-xl ${item.bg} px-3 py-1.5`}>
                        <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                        <span className={`text-xs font-black ${item.color}`}>{item.value}</span>
                        <span className="text-xs text-slate-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
