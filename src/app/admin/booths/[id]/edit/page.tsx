import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
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

    const admins = await db.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
    });

    const adminOptions = admins.map((u) => ({
        value: u.id,
        label: `${u.name || u.email} (Admin)`,
    }));

    // Map to a format suitable for the form
    const initialData = {
        id: booth.id,
        name: booth.name,
        price: booth.price,
        is_available: booth.is_available.toString(),
        user_id: booth.user_id,
        latitude: booth.latitude ? Number(booth.latitude) : "",
        longitude: booth.longitude ? Number(booth.longitude) : "",
        dimension: booth.dimension,
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
                {/* Breadcrumb */}
                <nav className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <Link href="/admin/booths" className="hover:text-orange-500 transition-colors">
                        Inventory
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-slate-900">Edit Booth</span>
                </nav>

                <header className="mb-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 mb-4">
                        <Store className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">แก้ไขข้อมูลบูธ</h1>
                    <p className="text-slate-500 mt-2">อัปเดตข้อมูลรายละเอียดบูธที่ {booth.name}</p>
                </header>

                <BoothForm admins={adminOptions} initialData={initialData} />
            </div>
        </div>
    );
}
