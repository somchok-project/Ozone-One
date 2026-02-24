// DashboardPage.tsx
import { db } from "@/server/db";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import StatsSection from "./_components/stats-section";
import BookingSection from "./_components/booking-section";
import ReviewsSection from "./_components/reviews-section";

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
        <StatsSection
          revenueChange={revenueChange}
          revenueChangeType={revenueChangeType}
          revenueThisMonth={revenueThisMonth}
          totalBookingsCount={totalBookingsCount}
          availableBoothsCount={availableBoothsCount}
          totalCustomers={totalCustomers}
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Bookings */}
          <BookingSection recentBookings={recentBookings} />

          {/* Recent Reviews */}
          <ReviewsSection recentReviews={recentReviews} />
        </div>
      </div>
    </div>
  );
}