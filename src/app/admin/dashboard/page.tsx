// DashboardPage.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import StatsSection from "./_components/stats-section";
import BookingSection from "./_components/booking-section";
import ReviewsSection from "./_components/reviews-section";
import { getDashboardStats } from "./actions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/customer");
  }

  const {
    revenueThisMonth,
    revenueChange,
    revenueChangeType,
    totalBookingsCount,
    availableBoothsCount,
    totalCustomers,
    recentBookings,
    recentReviews,
  } = await getDashboardStats();

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

        <div className="grid gap-8 ">
          {/* Recent Bookings */}
          <BookingSection recentBookings={recentBookings} />

          {/* Recent Reviews */}
          <ReviewsSection recentReviews={recentReviews} />
        </div>
      </div>
    </div>
  );
}