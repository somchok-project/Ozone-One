import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui";
import { db } from "@/server/db";
import { SearchInput } from "@/components/admin/SearchInput";

// Helper function to format date
const formatThaiDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

export default async function ReviewsPage(props: {
    searchParams?: Promise<{ q?: string; rating?: string }>;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const searchParams = await props.searchParams;
    const query = searchParams?.q || "";
    const ratingFilter = searchParams?.rating || "all";

    // Build the where clause for searching comment, user name, or email
    const whereClause: any = {};

    if (ratingFilter !== "all" && !isNaN(Number(ratingFilter))) {
        whereClause.rating = {
            gte: Number(ratingFilter),
            lt: Number(ratingFilter) + 1, // To catch decimal ratings if they exist e.g. 4.5 is fetched when filtering for 4 stars
        }
    }

    if (query) {
        whereClause.OR = [
            { comment: { contains: query, mode: "insensitive" } },
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } },
        ];
    }

    const reviews = await db.review.findMany({
        where: whereClause,
        include: {
            user: true,
        },
        orderBy: { created_at: "desc" },
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
                {/* Page Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">รีวิวทั้งหมด</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            ความคิดเห็นและคะแนนรีวิวจากลูกค้าในระบบ
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <SearchInput placeholder="ค้นหารีวิว จากชื่อลูกค้า, อีเมล, หรือเนื้อหา..." />
                            <div className="flex flex-wrap gap-2">
                                <Link href={`/admin/reviews?${new URLSearchParams({ ...(query ? { q: query } : {}), rating: 'all' }).toString()}`}>
                                    <Button variant={ratingFilter === 'all' ? 'primary' : 'outline'} size="sm" className="cursor-pointer gap-1">
                                        ทั้งหมด
                                    </Button>
                                </Link>
                                <Link href={`/admin/reviews?${new URLSearchParams({ ...(query ? { q: query } : {}), rating: '5' }).toString()}`}>
                                    <Button variant={ratingFilter === '5' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer gap-1">
                                        5 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </Button>
                                </Link>
                                <Link href={`/admin/reviews?${new URLSearchParams({ ...(query ? { q: query } : {}), rating: '4' }).toString()}`}>
                                    <Button variant={ratingFilter === '4' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer gap-1">
                                        4 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </Button>
                                </Link>
                                <Link href={`/admin/reviews?${new URLSearchParams({ ...(query ? { q: query } : {}), rating: '3' }).toString()}`}>
                                    <Button variant={ratingFilter === '3' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer gap-1">
                                        3 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </Button>
                                </Link>
                                <Link href={`/admin/reviews?${new URLSearchParams({ ...(query ? { q: query } : {}), rating: '2' }).toString()}`}>
                                    <Button variant={ratingFilter === '2' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer gap-1">
                                        2 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </Button>
                                </Link>
                                <Link href={`/admin/reviews?${new URLSearchParams({ ...(query ? { q: query } : {}), rating: '1' }).toString()}`}>
                                    <Button variant={ratingFilter === '1' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer gap-1">
                                        1 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>รายการรีวิว ({reviews.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[150px]">วันที่</TableHead>
                                        <TableHead className="w-[250px]">ลูกค้า</TableHead>
                                        <TableHead className="w-[100px]">คะแนน</TableHead>
                                        <TableHead>เนื้อหารีวิว</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviews.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell className="text-gray-500 text-sm">
                                                {formatThaiDate(review.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {review.user.name || "ไม่ระบุชื่อ"}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{review.user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 font-semibold text-gray-900">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    {Number(review.rating).toFixed(1)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-700">
                                                {review.comment || <span className="text-gray-400 italic">ไม่มีเนื้อหารีวิว</span>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {reviews.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                ไม่พบข้อมูลรีวิว
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
