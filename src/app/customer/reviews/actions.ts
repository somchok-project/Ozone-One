"use server";

import { db } from "@/server/db";

export async function getMarketReviews(params: { rating?: string; page?: string }) {
    const ratingFilter = params.rating || "all";
    const currentPage = Number(params.page) || 1;
    const ITEMS_PER_PAGE = 10;

    const whereClause: any = { type: "MARKET" };
    if (ratingFilter !== "all" && !isNaN(Number(ratingFilter))) {
        whereClause.rating = {
            gte: Number(ratingFilter),
            lt: Number(ratingFilter) + 1,
        };
    }

    const [reviewsRaw, totalCount] = await Promise.all([
        db.review.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, image: true } },
                booth: { select: { name: true } },
            },
            orderBy: { created_at: "desc" },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        db.review.count({ where: whereClause }),
    ]);

    const reviews = reviewsRaw.map((review) => ({
        ...review,
        rating: Number(review.rating),
    }));

    return {
        reviews,
        totalCount,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        currentPage,
    };
}
