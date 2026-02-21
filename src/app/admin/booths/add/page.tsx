import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/server/db";
import { BoothForm } from "../_components/BoothForm";

export default async function AddBoothPage() {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name || u.email} (${u.role})`,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/booths" className="hover:text-orange-600">
            จัดการบูธ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">เพิ่มบูธใหม่</span>
        </nav>

        <BoothForm users={userOptions} />
      </div>
    </div>
  );
}
