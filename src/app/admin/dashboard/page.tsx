// DashboardPage.tsx
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import StatsSection from "./_components/stats-section";
import BookingSection from "./_components/booking-section";
import ReviewsSection from "./_components/reviews-section";
import { getDashboardStats } from "./actions";

export default async function DashboardPage(props: {
  searchParams?: Promise<{ bookingPage?: string; reviewPage?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/customer");
  }

  const searchParams = await props.searchParams;

  const {
    revenueThisMonth,
    revenueChange,
    revenueChangeType,
    totalBookingsCount,
    availableBoothsCount,
    totalCustomers,
    recentBookings,
    recentReviews,
    totalBookingPages,
    currentBookingPage,
    totalReviewPages,
    currentReviewPage,
  } = await getDashboardStats({
    bookingPage: searchParams?.bookingPage,
    reviewPage: searchParams?.reviewPage,
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

        <div className="grid gap-8">
          {/* Recent Bookings */}
          <BookingSection 
            recentBookings={recentBookings} 
            totalBookingPages={totalBookingPages} 
            currentBookingPage={currentBookingPage} 
          />

          {/* Recent Reviews */}
          <ReviewsSection 
            recentReviews={recentReviews} 
            totalReviewPages={totalReviewPages} 
            currentReviewPage={currentReviewPage} 
          />
        </div>
      </div>
    </div>
  );
}