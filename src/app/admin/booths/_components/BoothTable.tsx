import Link from "next/link";
import { MapPin, Ruler, Edit, Store } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils/format";
import { BoothActions } from "./BoothActions";

interface BoothTableProps {
    booths: any[];
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
                            <th className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">ขนาด</th>
                            <th className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">ราคาเช่า</th>
                            <th className="px-6 py-5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">สถานะ</th>
                            <th className="px-8 py-5 text-right text-slate-500 font-bold text-[11px] uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {booths.map((booth) => (
                            <tr key={booth.id} className="group transition-colors hover:bg-orange-50/20">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-transform group-hover:scale-110">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{booth.name}</span>
                                            <span className="text-[11px] text-slate-400">สร้างโดย: {booth.user?.name || "Admin"}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    {booth.zone ? (
                                        <span
                                            className="inline-flex items-center rounded-2xl px-3 py-1 text-xs font-bold"
                                            style={{
                                                backgroundColor: booth.zone.color_code ? `${booth.zone.color_code}22` : "#f1f5f9",
                                                color: booth.zone.color_code ?? "#64748b",
                                            }}
                                        >
                                            <span
                                                className="mr-1.5 h-2 w-2 rounded-full"
                                                style={{ backgroundColor: booth.zone.color_code ?? "#94a3b8" }}
                                            />
                                            {booth.zone.name}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Ruler className="h-4 w-4 text-slate-300" />
                                        <span className="text-sm font-medium">{booth.dimension || "-"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-6 font-black text-slate-900 text-base">
                                    {formatCurrency(booth.price)}
                                </td>
                                <td className="px-6 py-6">
                                    {!booth.is_available ? (
                                        <span className="inline-flex items-center justify-center rounded-3xl px-4 py-1.5 text-[13px] font-bold w-[110px] bg-slate-100 text-slate-500">
                                            ปิดชั่วคราว
                                        </span>
                                    ) : booth.hasActiveBooking ? (
                                        <span className="inline-flex items-center justify-center rounded-3xl px-4 py-1.5 text-[13px] font-bold w-[110px] bg-[#FFD1D1] text-red-800">
                                            ถูกจองอยู่
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center rounded-3xl px-4 py-1.5 text-[13px] font-bold w-[110px] bg-[#C1FBE2] text-green-800">
                                            ว่างอยู่
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-6">
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
