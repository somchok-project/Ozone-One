import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/server/db";
import { UserForm } from "../_components/UserForm";
import { notFound } from "next/navigation";

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const userId = params.id;

    const user = await db.user.findUnique({
        where: { id: userId },
        include: { _count: { select: { bookings: true } } },
    });

    if (!user) {
        notFound();
    }

    const initialData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role as "ADMIN" | "CUSTOMER",
        image: user.image,
        bookingCount: user._count.bookings,
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="mx-auto max-w-5xl px-6 py-10">
                {/* Breadcrumb */}
                <nav className="mb-8 flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Link href="/admin/users" className="hover:text-orange-500 transition-colors">
                        จัดการผู้ใช้งาน
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-slate-700 font-bold">{user.name || user.email}</span>
                </nav>

                <UserForm initialData={initialData} />
            </div>
        </div>
    );
}
