import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/server/db";
import { BoothForm } from "../../_components/BoothForm";
import { notFound } from "next/navigation";

export default async function EditBoothPage({ params }: { params: { id: string } }) {
    const boothId = params.id;

    const booth = await db.booth.findUnique({
        where: { id: boothId },
    });

    if (!booth) {
        notFound();
    }

    const users = await db.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
    });

    const userOptions = users.map((u) => ({
        value: u.id,
        label: `${u.name || u.email} (${u.role})`,
    }));

    // Map to a format suitable for the form
    const initialData = {
        id: booth.id,
        name: booth.name,
        type: booth.type,
        price: booth.price,
        is_available: booth.is_available.toString(),
        user_id: booth.user_id,
        latitude: Number(booth.latitude),
        longitude: Number(booth.longitude),
        dimension: booth.dimension,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/admin/booths" className="hover:text-orange-600">
                        จัดการบูธ
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900">แก้ไขข้อมูลบูธ</span>
                </nav>

                <BoothForm users={userOptions} initialData={initialData} />
            </div>
        </div>
    );
}
