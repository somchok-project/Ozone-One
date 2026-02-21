import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, Eye } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
    Badge,
} from "@/components/ui";
import { db } from "@/server/db";
import { SearchInput } from "@/components/admin/SearchInput";

// Helper function to format date
const formatThaiDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

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

    // Build the where clause for searching user name, email, or booth name
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
        include: {
            user: true,
            booth: true,
        },
        orderBy: { start_date: "desc" },
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
                {/* Page Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">รายการจองทั้งหมด</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            รายละเอียดการจองบูธทั้งหมดในระบบ (ดูข้อมูลได้อย่างเดียว)
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <SearchInput placeholder="ค้นหาชื่อลูกค้า, อีเมล, หรือชื่อบูธ..." />
                            <div className="flex flex-wrap gap-2">
                                <Link href={`/admin/bookings?${new URLSearchParams({ ...(query ? { q: query } : {}), status: 'all' }).toString()}`}>
                                    <Button variant={statusFilter === 'all' ? 'primary' : 'outline'} size="sm" className="cursor-pointer">
                                        ทั้งหมด
                                    </Button>
                                </Link>
                                <Link href={`/admin/bookings?${new URLSearchParams({ ...(query ? { q: query } : {}), status: 'SUCCESS' }).toString()}`}>
                                    <Button variant={statusFilter === 'SUCCESS' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer">
                                        ชำระเงินแล้ว
                                    </Button>
                                </Link>
                                <Link href={`/admin/bookings?${new URLSearchParams({ ...(query ? { q: query } : {}), status: 'PENDING' }).toString()}`}>
                                    <Button variant={statusFilter === 'PENDING' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer">
                                        รอดำเนินการ
                                    </Button>
                                </Link>
                                <Link href={`/admin/bookings?${new URLSearchParams({ ...(query ? { q: query } : {}), status: 'CANCEL' }).toString()}`}>
                                    <Button variant={statusFilter === 'CANCEL' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer">
                                        ยกเลิกการจอง
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการจอง ({bookings.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>บูธ</TableHead>
                                        <TableHead>ลูกค้า</TableHead>
                                        <TableHead>วันที่จอง (เริ่ม - สิ้นสุด)</TableHead>
                                        <TableHead>ยอดชำระเงิน</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead className="text-right">สลิปโอนเงิน</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium text-gray-900">
                                                {booking.booth.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {booking.user.name || "ไม่ระบุชื่อ"}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{booking.user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                    <span>เริ่ม: {formatThaiDate(booking.start_date)}</span>
                                                    <span>ถึง: {formatThaiDate(booking.end_date)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">
                                                ฿{booking.total_price.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={booking.payment_status === "SUCCESS" ? "default" : "secondary"}
                                                    className={
                                                        booking.payment_status === "SUCCESS"
                                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                            : booking.payment_status === "PENDING"
                                                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                                    }
                                                >
                                                    {booking.payment_status === "SUCCESS"
                                                        ? "ชำระเงินแล้ว"
                                                        : booking.payment_status === "PENDING"
                                                            ? "รอดำเนินการ"
                                                            : "ยกเลิก"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {booking.payment_slip_url ? (
                                                    <a href={booking.payment_slip_url} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="h-9 px-3 gap-2 cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="ดูสลิป">
                                                            <Eye className="h-4 w-4" /> ดูสลิป
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {bookings.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                ไม่พบข้อมูลการจอง
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
