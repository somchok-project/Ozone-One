import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { BookingHeader } from "./_components/BookingHeader";
import { BookingFilters } from "./_components/BookingFilters";
import { BookingTable } from "./_components/BookingTable";

const ITEMS_PER_PAGE = 10;

export default async function BookingsPage(props: {
    searchParams?: Promise<{ q?: string; status?: string; page?: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const searchParams = await props.searchParams;
    const query = searchParams?.q || "";
    const statusFilter = searchParams?.status || "all";
    const currentPage = Number(searchParams?.page) || 1;

    const whereClause: any = {
        ...(statusFilter !== "all" ? { booking_status: statusFilter } : {}),
    };

    if (query) {
        whereClause.OR = [
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } },
            { booth: { name: { contains: query, mode: "insensitive" } } },
        ];
    }

    const [bookings, totalCount, pendingCount, confirmedCount, completedCount, cancelledCount] = await Promise.all([
        db.booking.findMany({
            where: whereClause,
            include: { user: true, booth: true },
            orderBy: { created_at: "desc" },
            skip: (currentPage - 1) * ITEMS_PER_PAGE,
            take: ITEMS_PER_PAGE,
        }),
        db.booking.count({ where: whereClause }),
        db.booking.count({ where: { booking_status: "PENDING" } }),
        db.booking.count({ where: { booking_status: "CONFIRMED" } }),
        db.booking.count({ where: { booking_status: "COMPLETED" } }),
        db.booking.count({ where: { booking_status: "CANCELLED" } }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const stats = { pending: pendingCount, confirmed: confirmedCount, completed: completedCount, cancelled: cancelledCount };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="mx-auto max-w-350 px-6 py-10">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <BookingHeader stats={stats} />
                    <BookingFilters query={query} statusFilter={statusFilter} />
                </div>

                <BookingTable bookings={bookings} totalPages={totalPages} currentPage={currentPage} />
            </div>
        </div>
    );
}