import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, Eye, MapPin, User, FileText } from "lucide-react";
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
import { db } from "@/server/db";
import { SearchInput } from "@/components/admin/SearchInput";
import { formatCurrency, formatThaiDateTime } from "@/lib/utils/format";
import { getColorStatus } from "@/lib/utils/color";
import { getLabelStatus } from "@/lib/utils/label";

export default async function BookingsPage(props: {
    searchParams?: Promise<{ q?: string; status?: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const searchParams = await props.searchParams;
    const query = searchParams?.q || "";
    const statusFilter = searchParams?.status || "all";

    const whereClause: any = {
        ...(statusFilter !== "all" ? { payment_status: statusFilter } : {}),
    };

    if (query) {
        whereClause.OR = [
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { booth: { name: { contains: query, mode: "insensitive" } } },
        ];
    }

    const bookings = await db.booking.findMany({
        where: whereClause,
        include: { user: true, booth: true },
        orderBy: { created_at: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="mx-auto max-w-[1400px] px-6 py-10">
                
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                            <CalendarCheck className="h-4 w-4" />
                            จัดการการจอง
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">รายการจองบูธ</h1>
                        <p className="text-slate-500 text-sm">ตรวจสอบสถานะและประวัติการเช่าบูธทั้งหมดในตลาด</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                        {['all', 'SUCCESS', 'PENDING', 'CANCEL'].map((status) => (
                            <Link 
                                key={status}
                                href={`/admin/bookings?${new URLSearchParams({ ...(query ? { q: query } : {}), status }).toString()}`}
                            >
                                <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    statusFilter === status 
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                                    : 'text-slate-500 hover:text-orange-500'
                                }`}>
                                    {status === 'all' ? 'ทั้งหมด' : getLabelStatus(status)}
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Search & Statistics Bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <SearchInput placeholder="ค้นหาชื่อลูกค้า, อีเมล, หรือชื่อบูธ..." />
                    </div>
                </div>

                {/* Main Table Card */}
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
                                        <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">สถานะ</TableHead>
                                        <TableHead className="pr-8 text-right text-slate-500 font-bold text-[11px] uppercase tracking-wider">สลิป</TableHead>
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
                                            <TableCell className="pr-8 text-right">
                                                {booking.payment_slip_url ? (
                                                    <a href={booking.payment_slip_url} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl text-orange-500 hover:bg-orange-100 hover:text-orange-600">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {bookings.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic">
                                                ไม่พบข้อมูลรายการจอง
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}