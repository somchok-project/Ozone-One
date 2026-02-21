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
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

// Helper functions for formatting
const formatThaiDate = (date: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${changeColors[changeType]}`}
            >
              {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
              {change}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Strict check: Only ADMIN can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/customer");
  }

  // Fetch data
  const booths = await db.booth.findMany({ include: { bookings: true } });
  const totalBooths = booths.length;

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const bookingsTodayCount = await db.booking.count({
    where: {
      start_date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const totalCustomers = await db.user.count({
    where: { role: "USER" },
  });

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const bookingsThisMonth = await db.booking.findMany({
    where: {
      start_date: {
        gte: thisMonthStart,
        lte: thisMonthEnd,
      },
      payment_status: "SUCCESS"
    },
    select: {
      total_price: true,
    }
  });

  const revenueThisMonth = bookingsThisMonth.reduce((acc, booking) => acc + booking.total_price, 0);

  // Recent Reviews (Last 5)
  const recentReviews = await db.review.findMany({
    take: 5,
    orderBy: {
      created_at: 'desc',
    },
    include: {
      user: true,
    },
  });

  // Recent Bookings (Last 5)
  const recentBookings = await db.booking.findMany({
    take: 5,
    orderBy: {
      start_date: 'desc',
    },
    include: {
      booth: true,
      user: true,
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
            title="การจองวันนี้"
            value={bookingsTodayCount.toString()}
            change="เริ่มวันนี้"
            changeType="positive"
            icon={<CalendarCheck className="h-6 w-6" />}
          />
          <StatCard
            title="ลูกค้าทั้งหมด"
            value={totalCustomers.toString()}
            change="ทั้งหมด"
            changeType="neutral"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="รายได้เดือนนี้"
            value={formatCurrency(revenueThisMonth)}
            change="เดือนปัจจุบัน"
            changeType="positive"
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>การจองล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.booth.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.user.name || booking.user.email} • {formatThaiDate(booking.start_date)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${booking.payment_status === "SUCCESS"
                        ? "bg-green-50 text-green-700"
                        : booking.payment_status === "PENDING"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                        }`}
                    >
                      {booking.payment_status === "SUCCESS"
                        ? "ชำระเงินแล้ว"
                        : booking.payment_status === "PENDING"
                          ? "รอดำเนินการ"
                          : "ยกเลิก"}
                    </span>
                  </div>
                ))}
                {recentBookings.length === 0 && (
                  <p className="text-center text-gray-500 py-4">ไม่มีรายการจองล่าสุด</p>
                )}
              </div>
              <Link
                href="/admin/bookings"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รีวิวล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.map((review, index) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{review.comment || "ไม่มีความคิดเห็น"}</p>
                        <p className="text-sm text-gray-500">
                          {review.user.name || review.user.email} • {formatThaiDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-900">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {Number(review.rating).toFixed(1)}
                    </div>
                  </div>
                ))}
                {recentReviews.length === 0 && (
                  <p className="text-center text-gray-500 py-4">ไม่มีข้อมูลรีวิว</p>
                )}
              </div>
              <Link
                href="/admin/reviews"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                ดูรีวิวทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
