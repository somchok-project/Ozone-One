// admin/booths/add/page.tsx
import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { db } from "@/server/db";
import { BoothForm } from "../_components/BoothForm";
import { getBoothPositions } from "../actions";

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

  // Fetch all booth positions for 3D market layout
  const allBooths = (await getBoothPositions()).map((b) => ({
    ...b,
    position_x: b.position_x ?? 0,
    position_y: b.position_y ?? 0,
    position_z: b.position_z ?? 0,
    rotation_y: b.rotation_y ?? 0,
    scale: b.scale ?? 1,
  }));

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

        <BoothForm admins={adminOptions} zones={zoneOptions} allBooths={allBooths} />
      </div>
    </div>
  );
}

