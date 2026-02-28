import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const bookingRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                booth_id: z.string().uuid(),
                start_date: z.string().datetime(),
                end_date: z.string().datetime(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const booth = await ctx.db.booth.findUniqueOrThrow({
                where: { id: input.booth_id },
            });

            if (!booth.is_available) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "บูธนี้ไม่ว่าง",
                });
            }

            const startDate = new Date(input.start_date);
            const endDate = new Date(input.end_date);

            if (endDate <= startDate) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "วันสิ้นสุดต้องมากกว่าวันเริ่ม",
                });
            }

            // Check overlapping bookings
            const overlapping = await ctx.db.booking.findFirst({
                where: {
                    booth_id: input.booth_id,
                    booking_status: { in: ["PENDING", "CONFIRMED"] },
                    OR: [
                        {
                            start_date: { lte: endDate },
                            end_date: { gte: startDate },
                        },
                    ],
                },
            });

            if (overlapping) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "ช่วงเวลานี้ถูกจองแล้ว",
                });
            }

            const days = Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            );
            const totalPrice = booth.price * days;

            return ctx.db.booking.create({
                data: {
                    start_date: startDate,
                    end_date: endDate,
                    total_price: totalPrice,
                    payment_status: "PENDING",
                    booking_status: "PENDING",
                    user_id: ctx.session.user.id,
                    booth_id: input.booth_id,
                },
                include: { booth: true },
            });
        }),

    confirmPayment: protectedProcedure
        .input(z.object({ booking_id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const booking = await ctx.db.booking.findUniqueOrThrow({
                where: { id: input.booking_id },
            });

            if (booking.user_id !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "ไม่มีสิทธิ์แก้ไข booking นี้",
                });
            }

            return ctx.db.booking.update({
                where: { id: input.booking_id },
                data: {
                    payment_status: "SUCCESS",
                    booking_status: "CONFIRMED",
                },
            });
        }),

    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.booking.findMany({
            where: { user_id: ctx.session.user.id },
            include: { booth: { include: { images: true } } },
            orderBy: { created_at: "desc" },
        });
    }),

    cancelBooking: protectedProcedure
        .input(z.object({ booking_id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const booking = await ctx.db.booking.findUniqueOrThrow({
                where: { id: input.booking_id },
            });

            if (booking.user_id !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "ไม่มีสิทธิ์ยกเลิก booking นี้",
                });
            }

            if (booking.booking_status !== "PENDING") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "สามารถยกเลิกได้เฉพาะการจองที่อยู่ในสถานะรอดำเนินการเท่านั้น",
                });
            }

            return ctx.db.booking.update({
                where: { id: input.booking_id },
                data: {
                    booking_status: "CANCELLED",
                    payment_status: "CANCEL",
                },
            });
        }),
});
