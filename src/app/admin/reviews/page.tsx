import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getReviews } from "./actions";
import ReviewHeader from "./_components/ReviewHeader";
import ReviewFilters from "./_components/ReviewFilters";
import ReviewFeed from "./_components/ReviewFeed";

export default async function ReviewsPage(props: {
    searchParams?: Promise<{ q?: string; rating?: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const searchParams = await props.searchParams;
    const { reviews, totalCount } = await getReviews({
        q: searchParams?.q,
        rating: searchParams?.rating,
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
                <ReviewHeader totalCount={totalCount} />
                <ReviewFilters />
                <ReviewFeed reviews={reviews} />
            </div>
        </div>
    );
}