// DashboardPage.tsx
import Link from "next/link";
import {
  CalendarCheck,
  Users,
  DollarSign,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatThaiDate } from "@/lib/utils/format";
import StatCard from "@/components/ui/statcard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/customer");
  }

  // --- Fetch Data ---
  const today = new Date();
  
  // 1. รายได้รวมเดือนนี้ (SUCCESS status เท่านั้น)
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const revenueData = await db.booking.aggregate({
    where: {
      payment_status: "SUCCESS",
      start_date: { gte: thisMonthStart, lte: thisMonthEnd },
    },
    _sum: { total_price: true },
  });

  // 1.1 รายได้เดือนที่แล้ว (SUCCESS status เท่านั้น)
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const lastMonthRevenueData = await db.booking.aggregate({
    where: {
      payment_status: "SUCCESS",
      start_date: { gte: lastMonthStart, lte: lastMonthEnd },
    },
    _sum: { total_price: true },
  });

  const revenueThisMonth = revenueData._sum.total_price ?? 0;
  const revenueLastMonth = lastMonthRevenueData._sum.total_price ?? 0;

  // คำนวณ % การเปลี่ยนแปลง
  let revenueChange = "0%";
  let revenueChangeType: "positive" | "negative" | "neutral" = "neutral";

  if (revenueLastMonth > 0) {
    const diff = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
    revenueChange = `${diff > 0 ? "+" : ""}${diff.toFixed(0)}% จากเดือนก่อน`;
    revenueChangeType = diff > 0 ? "positive" : diff < 0 ? "negative" : "neutral";
  } else if (revenueThisMonth > 0) {
    revenueChange = "ใหม่ในเดือนนี้";
    revenueChangeType = "positive";
  } else {
    revenueChange = "ไม่มีข้อมูลเดือนก่อน";
    revenueChangeType = "neutral";
  }

  // 2. การจองทั้งหมดในระบบตอนนี้ (ทุกสถานะ)
  const totalBookingsCount = await db.booking.count();

  // 3. บูธที่ว่าง (is_available = true)
  const availableBoothsCount = await db.booth.count({
    where: { is_available: true },
  });

  // 4. Customer ทั้งหมดในระบบ
  const totalCustomers = await db.user.count({
    where: { role: "CUSTOMER" },
  });

  // --- Recent Data for Tables ---
  const recentBookings = await db.booking.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: { booth: true, user: true },
  });

  const recentReviews = await db.review.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: { user: true, booth: true },
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        
        {/* Stats Section */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="รายได้รวมเดือนนี้"
            value={formatCurrency(revenueThisMonth)}
            change={revenueChange}
            changeType={revenueChangeType}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            title="การจองทั้งหมด"
            value={totalBookingsCount.toString()}
            change="รายการทั้งหมด"
            changeType="neutral"
            icon={<CalendarCheck className="h-5 w-5" />}
          />
          <StatCard
            title="บูธที่ว่างตอนนี้"
            value={availableBoothsCount.toString()}
            change="พร้อมให้เช่า"
            changeType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatCard
            title="ลูกค้าในระบบ"
            value={totalCustomers.toString()}
            change="บัญชีทั้งหมด"
            changeType="neutral"
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Bookings */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">การจองล่าสุด</CardTitle>
              <Link href="/admin/bookings" className="text-xs font-medium text-orange-600 hover:underline">
                ดูทั้งหมด
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{booking.booth.name}</p>
                      <p className="text-xs text-slate-500">
                        {booking.user.name ?? booking.user.email} • {formatThaiDate(booking.start_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(booking.total_price)}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        booking.payment_status === "SUCCESS" ? "text-emerald-600" : 
                        booking.payment_status === "PENDING" ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {booking.payment_status === "SUCCESS" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
                {recentBookings.length === 0 && (
                  <div className="py-10 text-center text-sm text-slate-400">ยังไม่มีข้อมูลการจอง</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">รีวิวล่าสุด</CardTitle>
              <Link href="/admin/reviews" className="text-xs font-medium text-orange-600 hover:underline">
                ดูทั้งหมด
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="flex items-start justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                         <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {review.type}
                        </span>
                        <span className="text-xs font-medium text-orange-600">{review.booth.name}</span>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-2 italic">"{review.comment ?? "ไม่มีข้อความ"}"</p>
                      <p className="mt-2 text-[11px] text-slate-400">โดย {review.user.name ?? review.user.email}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
                      <Star className="h-3 w-3 fill-amber-600" />
                      {Number(review.rating).toFixed(1)}
                    </div>
                  </div>
                ))}
                {recentReviews.length === 0 && (
                  <div className="py-10 text-center text-sm text-slate-400">ยังไม่มีข้อมูลรีวิว</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}