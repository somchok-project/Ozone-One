import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Ruler,
  Store,
  Edit,
  CalendarDays,
  TrendingUp,
  Users,
  DollarSign,
  CalendarX2,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import { db } from "@/server/db";
import { Card } from "@/components/ui";
import { formatCurrency, formatThaiDate } from "@/lib/utils/format";
import {
  getBookingStatusLabel,
  getBookingStatusColor,
} from "@/lib/utils/bookingStatus";
import BookingCalendar from "./_components/BookingCalendar";

export default async function BoothDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const booth = await db.booth.findUnique({
    where: { id: params.id },
    include: {
      zone: true,
      user: { select: { name: true, email: true } },
      images: { take: 1 },
      bookings: {
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { start_date: "desc" },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!booth) notFound();

  const now = new Date();

  // Stats
  const totalRevenue = booth.bookings
    .filter((b) => b.payment_status === "SUCCESS")
    .reduce((sum, b) => sum + b.total_price, 0);

  const confirmedCount = booth.bookings.filter(
    (b) => b.booking_status === "CONFIRMED" || b.booking_status === "COMPLETED"
  ).length;

  const pendingCount = booth.bookings.filter(
    (b) => b.booking_status === "PENDING"
  ).length;

  const cancelledCount = booth.bookings.filter(
    (b) => b.booking_status === "CANCELLED"
  ).length;

  const activeToday = booth.bookings.find(
    (b) =>
      ["CONFIRMED", "PENDING"].includes(b.booking_status) &&
      new Date(b.start_date) <= now &&
      new Date(b.end_date) >= now
  );

  const upcomingCount = booth.bookings.filter(
    (b) =>
      ["CONFIRMED", "PENDING"].includes(b.booking_status) &&
      new Date(b.start_date) > now
  ).length;

  // Serialize for client component (Decimal → number)
  const bookingsForCalendar = booth.bookings.map((b) => ({
    id: b.id,
    start_date: b.start_date.toISOString(),
    end_date: b.end_date.toISOString(),
    booking_status: b.booking_status as
      | "PENDING"
      | "CONFIRMED"
      | "COMPLETED"
      | "CANCELLED",
    payment_status: b.payment_status as "PENDING" | "SUCCESS" | "CANCEL",
    total_price: b.total_price,
    user: { name: b.user.name, email: b.user.email },
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-300 px-6 py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          <Link href="/admin/booths" className="transition-colors hover:text-orange-500">
            Inventory
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900">{booth.name}</span>
        </nav>

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {booth.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {booth.zone && (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: booth.zone.color_code
                        ? `${booth.zone.color_code}22`
                        : "#f1f5f9",
                      color: booth.zone.color_code ?? "#64748b",
                    }}
                  >
                    <span
                      className="mr-1 h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: booth.zone.color_code ?? "#94a3b8",
                      }}
                    />
                    {booth.zone.name}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Ruler className="h-3 w-3" />
                  {booth.dimension}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3 w-3" />
                  {booth.user?.name ?? "Admin"}
                </span>
                {/* Live status */}
                {!booth.is_available ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                    <CalendarX2 className="h-3 w-3" />
                    ปิดชั่วคราว
                  </span>
                ) : activeToday ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                    <CalendarClock className="h-3 w-3" />
                    ถูกจองวันนี้
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                    <CalendarCheck className="h-3 w-3" />
                    ว่างอยู่
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link
            href={`/admin/booths/${booth.id}/edit`}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition-all hover:bg-orange-600"
          >
            <Edit className="h-4 w-4" />
            แก้ไขข้อมูล
          </Link>
        </div>

        {/* ── Stat Cards ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              รายได้รวม
            </p>
            <p className="mt-1 text-xl font-black text-slate-900">
              {formatCurrency(totalRevenue)}
            </p>
          </Card>
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              การจองทั้งหมด
            </p>
            <p className="mt-1 text-xl font-black text-slate-900">
              {booth.bookings.length}
            </p>
          </Card>
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              กำลังจะมา
            </p>
            <p className="mt-1 text-xl font-black text-slate-900">
              {upcomingCount}
              {pendingCount > 0 && (
                <span className="ml-1.5 text-sm font-medium text-amber-500">
                  ({pendingCount} รอยืนยัน)
                </span>
              )}
            </p>
          </Card>
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ยืนยัน / ยกเลิก
            </p>
            <p className="mt-1 text-xl font-black text-slate-900">
              <span className="text-green-600">{confirmedCount}</span>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="text-slate-400">{cancelledCount}</span>
            </p>
          </Card>
        </div>

        {/* ── Booking Calendar ── */}
        <Card className="mb-8 rounded-3xl border-none p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-black text-slate-900">
            <CalendarDays className="h-5 w-5 text-orange-500" />
            ตารางการจอง
          </h2>
          <BookingCalendar bookings={bookingsForCalendar} />
        </Card>

        {/* ── Booking History Table ── */}
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <div className="border-b border-slate-50 px-6 py-5">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <CalendarDays className="h-5 w-5 text-slate-400" />
              ประวัติการจองทั้งหมด
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-500">
                {booth.bookings.length}
              </span>
            </h2>
          </div>
          {booth.bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-slate-200" />
              <p className="font-medium text-slate-400">ยังไม่มีประวัติการจอง</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ช่วงวันที่
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      จำนวนวัน
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ยอดชำระ
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {booth.bookings.map((b) => {
                    const days = Math.ceil(
                      (new Date(b.end_date).getTime() -
                        new Date(b.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={b.id} className="hover:bg-orange-50/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                              {(b.user.name ?? b.user.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {b.user.name ?? "-"}
                              </p>
                              <p className="text-[11px] text-slate-400">{b.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatThaiDate(new Date(b.start_date))} — {formatThaiDate(new Date(b.end_date))}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600">
                            {days} วัน
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">
                          {formatCurrency(b.total_price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${getBookingStatusColor(b.booking_status)}`}
                          >
                            {getBookingStatusLabel(b.booking_status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
