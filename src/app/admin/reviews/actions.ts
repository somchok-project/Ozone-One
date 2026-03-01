"use server";

import { db } from "@/server/db";

export async function getReviews(params: { q?: string; rating?: string; page?: string }) {
    const query = params.q || "";
    const ratingFilter = params.rating || "all";
    const currentPage = Number(params.page) || 1;
    const ITEMS_PER_PAGE = 10;

    const whereClause: any = {};
    if (ratingFilter !== "all" && !isNaN(Number(ratingFilter))) {
        whereClause.rating = {
            gte: Number(ratingFilter),
            lt: Number(ratingFilter) + 1,
        };
    }

    if (query) {
        whereClause.OR = [
            { comment: { contains: query, mode: "insensitive" } },
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { booth: { name: { contains: query, mode: "insensitive" } } },
        ];
    }

    const [reviewsRaw, totalCount] = await Promise.all([
        db.review.findMany({
            where: whereClause,
            include: {
                user: true,
                booth: true,
            },
            orderBy: { created_at: "desc" },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        db.review.count({ where: whereClause })
    ]);

    // Convert Decimal to number for serialization
    const reviews = reviewsRaw.map((review) => ({
        ...review,
        rating: Number(review.rating),
        booth: review.booth ? {
            ...review.booth,
            latitude: review.booth.latitude ? Number(review.booth.latitude) : null,
            longitude: review.booth.longitude ? Number(review.booth.longitude) : null,
            price: Number(review.booth.price),
        } : null,
    }));

    return {
        reviews,
        totalCount,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        currentPage,
    };
}
