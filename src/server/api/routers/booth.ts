import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const boothRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ zoneId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.booth.findMany({
        where: {
          is_available: true,
          ...(input?.zoneId && input.zoneId !== "all"
            ? { zone_id: input.zoneId }
            : {}),
        },
        include: {
          images: true,
          zone: true,
          reviews: {
            include: { user: { select: { name: true, image: true } } },
          },
          _count: { select: { bookings: true, reviews: true } },
        },
        orderBy: { created_at: "desc" },
      });
    }),

  getZones: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.zone.findMany({
      select: {
        id: true,
        name: true,
        color_code: true,
      },
      orderBy: { name: "asc" },
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
      avgRating: avgRating._avg.rating?.toNumber() ?? 0,
      totalBookings,
    };
  }),
});
