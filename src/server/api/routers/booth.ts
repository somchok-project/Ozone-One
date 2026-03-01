import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const boothRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.booth.findMany({
      where: { is_available: true },
      include: {
        images: true,
        reviews: {
          include: { user: { select: { name: true, image: true } } },
        },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.booth.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          images: true,
          reviews: {
            include: { user: { select: { name: true, image: true } } },
            orderBy: { created_at: "desc" },
          },
          bookings: {
            where: {
              booking_status: { in: ["CONFIRMED", "PENDING"] },
              end_date: { gte: new Date() },
            },
            select: { start_date: true, end_date: true },
          },
        },
      });
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const [totalBooths, avgRating, totalBookings] = await Promise.all([
      ctx.db.booth.count(),
      ctx.db.review.aggregate({
        _avg: {
          rating: true,
        },
      }),
      ctx.db.booking.count(),
    ]);

    return {
      totalBooths,
      avgRating: avgRating._avg.rating?.toNumber() || 0,
      totalBookings,
    };
  }),
});
