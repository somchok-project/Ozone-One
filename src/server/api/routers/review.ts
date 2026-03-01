import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const reviewRouter = createTRPCRouter({
  /** Create a review (booth or market) */
  create: protectedProcedure
    .input(
      z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        type: z.enum(["BOOTH", "MARKET"]),
        booth_id: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === "BOOTH" && !input.booth_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ต้องระบุบูธสำหรับรีวิวประเภท BOOTH",
        });
      }

      // For booth reviews: user must have a completed booking for that booth
      if (input.type === "BOOTH" && input.booth_id) {
        const completedBooking = await ctx.db.booking.findFirst({
          where: {
            user_id: ctx.session.user.id,
            booth_id: input.booth_id,
            booking_status: { in: ["COMPLETED", "CONFIRMED"] },
          },
        });
        if (!completedBooking) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "คุณต้องเคยจองบูธนี้ก่อนถึงจะสามารถรีวิวได้",
          });
        }

        // Prevent duplicate reviews
        const existing = await ctx.db.review.findFirst({
          where: {
            user_id: ctx.session.user.id,
            booth_id: input.booth_id,
            type: "BOOTH",
          },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "คุณได้รีวิวบูธนี้แล้ว",
          });
        }
      }

      return ctx.db.review.create({
        data: {
          rating: input.rating,
          comment: input.comment,
          type: input.type,
          user_id: ctx.session.user.id,
          booth_id: input.booth_id,
        },
        include: {
          user: { select: { name: true, image: true } },
        },
      });
    }),

  /** Get all market reviews */
  getMarketReviews: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const cursor = input?.cursor;

      const reviews = await ctx.db.review.findMany({
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        where: { type: "MARKET" },
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { created_at: "desc" },
      });

      let nextCursor: string | undefined;
      if (reviews.length > limit) {
        nextCursor = reviews.pop()!.id;
      }

      return { reviews, nextCursor };
    }),

  /** Get reviews for a specific booth */
  getBoothReviews: publicProcedure
    .input(z.object({ booth_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.review.findMany({
        where: { booth_id: input.booth_id, type: "BOOTH" },
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { created_at: "desc" },
      });
    }),

  /** Check if user can review a given booth */
  canReview: protectedProcedure
    .input(z.object({ booth_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [completed, existing] = await Promise.all([
        ctx.db.booking.findFirst({
          where: {
            user_id: ctx.session.user.id,
            booth_id: input.booth_id,
            booking_status: { in: ["COMPLETED", "CONFIRMED"] },
          },
        }),
        ctx.db.review.findFirst({
          where: {
            user_id: ctx.session.user.id,
            booth_id: input.booth_id,
            type: "BOOTH",
          },
        }),
      ]);

      return {
        canReview: !!completed && !existing,
        hasReviewed: !!existing,
        hasBooked: !!completed,
      };
    }),
});
