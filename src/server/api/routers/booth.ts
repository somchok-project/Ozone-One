import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { cleanupExpiredBookings } from "@/server/utils/cleanupExpiredBookings";

export const boothRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ zoneId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      await cleanupExpiredBookings();
      const now = new Date();
      const booths = await ctx.db.booth.findMany({
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
          // Include currently active bookings to compute isCurrentlyBooked
          bookings: {
            where: {
              booking_status: { in: ["CONFIRMED", "PENDING"] },
              start_date: { lte: now },
              end_date: { gte: now },
            },
            select: { id: true },
          },
        },
        orderBy: { created_at: "desc" },
      });

      return booths.map((b) => ({
        ...b,
        isCurrentlyBooked: b.bookings.length > 0,
      }));
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
          booth_items: true,
        },
      });
    }),

  /** Get all booths with 3D position data for the interactive map */
  getMapData: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const booths = await ctx.db.booth.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        is_available: true,
        dimension: true,
        position_x: true,
        position_y: true,
        position_z: true,
        rotation_x: true,
        rotation_y: true,
        rotation_z: true,
        scale: true,
        model_url: true,
        zone: { select: { id: true, name: true, color_code: true } },
        images: { take: 1, select: { path: true } },
        _count: { select: { reviews: true } },
        bookings: {
          where: {
            booking_status: { in: ["CONFIRMED", "PENDING"] },
            start_date: { lte: now },
            end_date: { gte: now },
          },
          select: { id: true },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return booths.map((b) => ({
      ...b,
      isCurrentlyBooked: b.bookings.length > 0,
    }));
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
