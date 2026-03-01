// admin/booths/add/page.tsx
import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { db } from "@/server/db";
import { BoothForm } from "../_components/BoothForm";

export default async function AddBoothPage() {
  // ดึงเฉพาะคนที่มีสิทธิ์จัดการ (Admin) เพื่อมาเป็นคนดูแลบูธ
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const adminOptions = admins.map((u) => ({
    value: u.id,
    label: `${u.name || u.email} (Admin)`,
  }));

  const zones = await db.zone.findMany({
    orderBy: { name: "asc" },
  });

  const zoneOptions = zones.map((z) => ({
    value: z.id,
    label: z.name,
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
  
        <BoothForm admins={adminOptions} zones={zoneOptions} />
      </div>
    </div>
  );
}
