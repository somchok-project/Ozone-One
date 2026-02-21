import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/server/db";
import { UserForm } from "../_components/UserForm";
import { notFound } from "next/navigation";

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const userId = params.id;

    const user = await db.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        notFound();
    }

    const initialData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/admin/users" className="hover:text-purple-600">
                        จัดการผู้ใช้งาน
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900">แก้ไขข้อมูลผู้ใช้งาน</span>
                </nav>

                <UserForm initialData={initialData} />
            </div>
        </div>
    );
}
