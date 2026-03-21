import { db } from "@/server/db";

const BOOKING_EXPIRE_MINUTES = 10;

/**
 * Cancel all PENDING bookings that were created more than 10 minutes ago.
 * This frees the booth slots for other users.
 */
export async function cleanupExpiredBookings() {
  const expireBefore = new Date(
    Date.now() - BOOKING_EXPIRE_MINUTES * 60 * 1000,
  );

  await db.booking.updateMany({
    where: {
      booking_status: "PENDING",
      payment_status: "PENDING",
      created_at: { lt: expireBefore },
    },
    data: {
      booking_status: "CANCELLED",
      payment_status: "CANCEL",
    },
  });
}
