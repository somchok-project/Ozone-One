import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getMarketReviews } from "./actions";
import CustomerReviewFeed from "./_components/CustomerReviewFeed";
import CustomerReviewFilters from "./_components/CustomerReviewFilters";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CustomerReviewsPage(props: {
  searchParams?: Promise<{ rating?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const searchParams = await props.searchParams;
  const { reviews, totalCount, totalPages, currentPage } =
    await getMarketReviews({
      rating: searchParams?.rating,
      page: searchParams?.page,
    });

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/customer"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition-colors hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            กลับหน้าหลัก
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Star size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                รีวิวภาพรวมตลาด
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                ทั้งหมด {totalCount} รีวิว จากผู้ใช้งานจริง
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CustomerReviewFilters />

        {/* Review Feed */}
        <CustomerReviewFeed
          reviews={reviews}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
