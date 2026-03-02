import Link from "next/link";
import { MapPin, Ruler, Store, CalendarClock, CalendarCheck, CalendarX2 } from "lucide-react";
import { Card } from "@/components/ui";
import { formatCurrency, formatThaiDate } from "@/lib/utils/format";
import { BoothActions } from "./BoothActions";

interface ActiveBooking {
    start_date: Date | string;
    end_date: Date | string;
    booking_status: string;
    user: { name: string | null } | null;
}

interface NextBooking {
    start_date: Date | string;
    end_date: Date | string;
}

interface BoothRow {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    dimension: string | null;
    user: { name: string | null } | null;
    zone: { name: string; color_code: string | null } | null;
    hasActiveBooking: boolean;
    activeBooking: ActiveBooking | null;
    upcomingCount: number;
    nextBooking: NextBooking | null;
}

interface BoothTableProps {
    booths: BoothRow[];
}

export function BoothTable({ booths }: BoothTableProps) {
    return (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">ชื่อบูธ / ทำเล</th>
                            <th className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">โซน</th>
                            <th className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">ขนาด / ราคา</th>
                            <th className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">สถานะวันนี้</th>
                            <th className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">การจองที่กำลังจะมา</th>
                            <th className="px-8 py-5 text-right text-slate-500 font-bold text-[11px] uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {booths.map((booth) => (
                            <tr key={booth.id} className="group transition-colors hover:bg-orange-50/20">
                                {/* Name */}
                                <td className="px-8 py-5">
                                    <Link href={`/admin/booths/${booth.id}`} className="flex items-center gap-4 group/name">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-transform group-hover:scale-110 group-hover/name:bg-orange-500 group-hover/name:text-white">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 group-hover/name:text-orange-600 transition-colors">{booth.name}</span>
                                            <span className="text-[11px] text-slate-400">สร้างโดย: {booth.user?.name ?? "Admin"}</span>
                                        </div>
                                    </Link>
                                </td>

                                {/* Zone */}
                                <td className="px-6 py-5">
                                    {booth.zone ? (
                                        <span
                                            className="inline-flex items-center rounded-2xl px-3 py-1 text-xs font-bold"
                                            style={{
                                                backgroundColor: booth.zone.color_code ? `${booth.zone.color_code}22` : "#f1f5f9",
                                                color: booth.zone.color_code ?? "#64748b",
                                            }}
                                        >
                                            <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: booth.zone.color_code ?? "#94a3b8" }} />
                                            {booth.zone.name}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </td>

                                {/* Dimension + Price */}
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <Ruler className="h-3.5 w-3.5 text-slate-300" />
                                            <span className="text-sm font-medium">{booth.dimension ?? "-"}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{formatCurrency(booth.price)}</span>
                                    </div>
                                </td>

                                {/* Status today */}
                                <td className="px-6 py-5">
                                    {!booth.is_available ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex w-fit items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-1.5 text-[12px] font-bold text-slate-500">
                                                <CalendarX2 className="h-3.5 w-3.5" />
                                                ปิดชั่วคราว
                                            </span>
                                            <span className="text-[11px] text-slate-400">Admin ปิดรับจอง</span>
                                        </div>
                                    ) : booth.hasActiveBooking ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex w-fit items-center gap-1.5 rounded-2xl bg-[#FFD1D1] px-3 py-1.5 text-[12px] font-bold text-red-800">
                                                <CalendarClock className="h-3.5 w-3.5" />
                                                ถูกจองอยู่
                                            </span>
                                            {booth.activeBooking && (
                                                <span className="text-[11px] text-slate-400">
                                                    หมด {formatThaiDate(new Date(booth.activeBooking.end_date))}
                                                    {booth.activeBooking.user?.name && (
                                                        <> · {booth.activeBooking.user.name}</>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex w-fit items-center gap-1.5 rounded-2xl bg-[#C1FBE2] px-3 py-1.5 text-[12px] font-bold text-green-800">
                                                <CalendarCheck className="h-3.5 w-3.5" />
                                                ว่างอยู่
                                            </span>
                                            {booth.nextBooking ? (
                                                <span className="text-[11px] text-slate-400">
                                                    จะว่างถึง {formatThaiDate(new Date(booth.nextBooking.start_date))}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400">ไม่มีคิวจอง</span>
                                            )}
                                        </div>
                                    )}
                                </td>

                                {/* Upcoming bookings */}
                                <td className="px-6 py-5">
                                    {booth.upcomingCount > 0 ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-slate-900">{booth.upcomingCount} รายการ</span>
                                            {booth.nextBooking && !booth.hasActiveBooking && (
                                                <span className="text-[11px] text-slate-400">
                                                    เริ่ม {formatThaiDate(new Date(booth.nextBooking.start_date))}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[12px] text-slate-300">—</span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-8 py-5">
                                    <BoothActions boothId={booth.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {booths.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                            <Store className="h-8 w-8 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">ไม่พบข้อมูลบูธ</h3>
                        <p className="text-slate-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
