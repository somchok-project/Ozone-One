"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function confirmBookingAction(bookingId: string) {
  try {
    await requireAdmin();
    await db.booking.update({
      where: { id: bookingId },
      data: { booking_status: "CONFIRMED", payment_status: "SUCCESS" },
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "ไม่สามารถยืนยันการจองได้" };
  }
}

export async function completeBookingAction(bookingId: string) {
  try {
    await requireAdmin();
    await db.booking.update({
      where: { id: bookingId },
      data: { booking_status: "COMPLETED" },
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "ไม่สามารถเปลี่ยนสถานะเป็น Completed ได้" };
  }
}

export async function cancelBookingAction(bookingId: string) {
  try {
    await requireAdmin();
    await db.booking.update({
      where: { id: bookingId },
      data: { booking_status: "CANCELLED", payment_status: "CANCEL" },
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "ไม่สามารถยกเลิกการจองได้" };
  }
}
