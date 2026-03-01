import { MapPin, Eye } from "lucide-react";
import {
    Card,
    CardContent,
    Button,
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui";
import { formatCurrency, formatThaiDateTime } from "@/lib/utils/format";
import { getColorStatus } from "@/lib/utils/color";
import { getLabelStatus } from "@/lib/utils/label";
import { getBookingStatusColor, getBookingStatusLabel } from "@/lib/utils/bookingStatus";
import { Pagination } from "@/components/admin/Pagination";
import { BookingActions } from "./BookingActions";

interface BookingTableProps {
    bookings: any[];
    totalPages: number;
    currentPage: number;
}

export function BookingTable({ bookings, totalPages, currentPage }: BookingTableProps) {
    return (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100">
                                <TableHead className="py-5 pl-8 text-slate-500 font-bold text-[11px] uppercase tracking-wider">รายละเอียดบูธ</TableHead>
                                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">ข้อมูลคนเช่า</TableHead>
                                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">ช่วงเวลาที่จอง</TableHead>
                                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">ยอดเงิน</TableHead>
                                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">สถานะจ่าย</TableHead>
                                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">สถานะจอง</TableHead>
                                <TableHead className="pr-8 text-right text-slate-500 font-bold text-[11px] uppercase tracking-wider">สลิป / จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id} className="group border-b border-slate-50 transition-colors hover:bg-orange-50/20">
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center transition-transform group-hover:scale-110">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <span className="font-bold text-slate-800">{booking.booth.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{booking.user.name || "ไม่ระบุชื่อ"}</span>
                                                <span className="text-xs text-slate-400">{booking.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-[13px]">
                                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                {formatThaiDateTime(booking.start_date)}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 italic">
                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                                ถึง {formatThaiDateTime(booking.end_date)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-black text-slate-900 text-base">
                                            {formatCurrency(booking.total_price)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            getColorStatus(booking.payment_status).badge
                                        }`}>
                                            {getLabelStatus(booking.payment_status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getBookingStatusColor(booking.booking_status)}`}>
                                            {getBookingStatusLabel(booking.booking_status)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="pr-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {booking.payment_slip_url && (
                                                <a href={booking.payment_slip_url} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl text-orange-500 hover:bg-orange-100 hover:text-orange-600">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                            )}
                                            <BookingActions
                                                bookingId={booking.id}
                                                bookingStatus={booking.booking_status}
                                                paymentStatus={booking.payment_status}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {bookings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20 text-slate-400 italic">
                                        ไม่พบข้อมูลรายการจอง
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {totalPages > 1 && (
                    <div className="border-t border-slate-100 p-4">
                        <Pagination totalPages={totalPages} currentPage={currentPage} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
