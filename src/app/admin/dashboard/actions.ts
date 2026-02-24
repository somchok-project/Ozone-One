"use server";

import { db } from "@/server/db";

export async function getDashboardStats(params?: { bookingPage?: string; reviewPage?: string }) {
  const currentBookingPage = Number(params?.bookingPage) || 1;
  const currentReviewPage = Number(params?.reviewPage) || 1;
  const ITEMS_PER_PAGE = 5;

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
  const [recentBookingsRaw, totalRecentBookings] = await Promise.all([
    db.booking.findMany({
      skip: (currentBookingPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { created_at: "desc" },
      include: { booth: true, user: true },
    }),
    db.booking.count()
  ]);

  const [recentReviewsRaw, totalRecentReviews] = await Promise.all([
    db.review.findMany({
      skip: (currentReviewPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { created_at: "desc" },
      include: { user: true, booth: true },
    }),
    db.review.count()
  ]);

  // Convert Decimal to number for serialization
  const recentBookings = recentBookingsRaw.map((booking) => ({
    ...booking,
    booth: {
      ...booking.booth,
      latitude: booking.booth.latitude ? Number(booking.booth.latitude) : null,
      longitude: booking.booth.longitude ? Number(booking.booth.longitude) : null,
      price: Number(booking.booth.price),
    },
    total_price: Number(booking.total_price),
  }));

  const recentReviews = recentReviewsRaw.map((review) => ({
    ...review,
    rating: Number(review.rating),
    booth: {
      ...review.booth,
      latitude: review.booth.latitude ? Number(review.booth.latitude) : null,
      longitude: review.booth.longitude ? Number(review.booth.longitude) : null,
      price: Number(review.booth.price),
    },
  }));

  return {
    revenueThisMonth,
    revenueChange,
    revenueChangeType,
    totalBookingsCount,
    availableBoothsCount,
    totalCustomers,
    recentBookings,
    recentReviews,
    totalBookingPages: Math.ceil(totalRecentBookings / ITEMS_PER_PAGE),
    currentBookingPage,
    totalReviewPages: Math.ceil(totalRecentReviews / ITEMS_PER_PAGE),
    currentReviewPage,
  };
}
