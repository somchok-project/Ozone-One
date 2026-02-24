import Link from "next/link";
import {
  Store,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // ตรวจสอบ path card อีกครั้ง
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatThaiDate } from "@/lib/utils/format";
import StatCard from "@/components/ui/statcard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login"); // หรือ path login ของคุณ
  }

  if (session.user.role !== "ADMIN") {
    redirect("/customer");
  }

  // --- Fetch Data ---
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));
  const totalBooths = await db.booth.count();
  const bookingsTodayCount = await db.booking.count({
    where: {
      created_at: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const totalCustomers = await db.user.count({
    where: { role: "CUSTOMER" },
  });

  // 4. รายได้เดือนนี้ (นับเฉพาะที่จ่ายเงินสำเร็จ)
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const revenueData = await db.booking.aggregate({
    where: {
      start_date: { gte: thisMonthStart, lte: thisMonthEnd },
      payment_status: "SUCCESS",
    },
    _sum: {
      total_price: true,
    },
  });
  const revenueThisMonth = revenueData._sum.total_price ?? 0;

  // 5. การจองล่าสุด (Last 5)
  const recentBookings = await db.booking.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: {
      booth: true,
      user: true,
    },
  });

  // 6. รีวิวล่าสุด (Last 5) - รวมข้อมูลบูธที่ถูกรีวิวด้วย
  const recentReviews = await db.review.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: {
      user: true,
      booth: true, // เพิ่มบูธเข้ามาเพื่อให้ Admin รู้ว่ารีวิวที่ไหน
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        
        {/* Stats Section */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="บูธทั้งหมด"
            value={totalBooths.toString()}
            change="ข้อมูลล่าสุด"
            changeType="neutral"
            icon={<Store className="h-6 w-6" />}
          />
          <StatCard
            title="รายการจองใหม่วันนี้"
            value={bookingsTodayCount.toString()}
            change="ทำรายการวันนี้"
            changeType="positive"
            icon={<CalendarCheck className="h-6 w-6" />}
          />
          <StatCard
            title="ลูกค้าทั้งหมด"
            value={totalCustomers.toString()}
            change="Registered"
            changeType="neutral"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="รายได้เดือนนี้"
            value={formatCurrency(revenueThisMonth)}
            change="ยอดชำระสำเร็จ"
            changeType="positive"
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Bookings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">การจองล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                    <div>
                      <p className="font-medium text-gray-900">{booking.booth.name}</p>
                      <p className="text-sm text-gray-500">
                        {booking.user.name || booking.user.email} • {formatThaiDate(booking.start_date)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      booking.payment_status === "SUCCESS" ? "bg-green-50 text-green-700" : 
                      booking.payment_status === "PENDING" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                    }`}>
                      {booking.payment_status === "SUCCESS" ? "ชำระเงินแล้ว" : 
                       booking.payment_status === "PENDING" ? "รอสลิป" : "ยกเลิก"}
                    </span>
                  </div>
                ))}
                {recentBookings.length === 0 && <p className="text-center text-gray-500 py-4">ไม่มีรายการจองล่าสุด</p>}
              </div>
              <Link href="/admin/bookings" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                ดูทั้งหมด <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Reviews Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รีวิวล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${review.type === 'MARKET' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600'}`}>
                          {review.type}
                        </span>
                        <p className="text-xs font-bold text-orange-600">{review.booth.name}</p>
                      </div>
                      <p className="font-medium text-gray-900 line-clamp-1 mt-1">{review.comment || "ไม่มีความคิดเห็น"}</p>
                      <p className="text-xs text-gray-500">
                        {review.user.name || review.user.email} • {formatThaiDate(review.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-900 ml-4">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {Number(review.rating).toFixed(1)}
                    </div>
                  </div>
                ))}
                {recentReviews.length === 0 && <p className="text-center text-gray-500 py-4">ไม่มีข้อมูลรีวิว</p>}
              </div>
              <Link href="/admin/reviews" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
                ดูรีวิวทั้งหมด <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}