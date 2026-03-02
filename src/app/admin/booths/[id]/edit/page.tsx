import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { db } from "@/server/db";
import { BoothForm } from "../../_components/BoothForm";
import { notFound } from "next/navigation";

export default async function EditBoothPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const boothId = params.id;

  const booth = await db.booth.findUnique({
    where: { id: boothId },
    include: { booth_items: true },
  });

  if (!booth) {
    notFound();
  }

  const [admins, zones] = await Promise.all([
    db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    db.zone.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const adminOptions = admins.map((u) => ({
    value: u.id,
    label: `${u.name || u.email} (Admin)`,
  }));

  const zoneOptions = zones.map((z) => ({
    value: z.id,
    label: z.name,
  }));

  // Map to a format suitable for the form
  const initialData = {
    id: booth.id,
    name: booth.name,
    price: booth.price,
    is_available: booth.is_available,
    user_id: booth.user_id,
    zone_id: booth.zone_id,
    latitude: booth.latitude ? Number(booth.latitude) : "",
    longitude: booth.longitude ? Number(booth.longitude) : "",
    dimension: booth.dimension,
    position_x: booth.position_x,
    position_y: booth.position_y,
    position_z: booth.position_z,
    rotation_x: booth.rotation_x,
    rotation_y: booth.rotation_y,
    rotation_z: booth.rotation_z,
    scale: booth.scale,
    model_url: booth.model_url,
    // Serialize saved furniture items for the 3D Configurator
    booth_items: JSON.stringify(
      booth.booth_items.map((item) => ({
        id: item.id,
        type: item.item_type,
        color: item.color,
        position: [item.position_x, item.position_y, item.position_z],
        rotation: [item.rotation_x, item.rotation_y, item.rotation_z],
      })),
    ),
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
          <Link
            href="/admin/booths"
            className="transition-colors hover:text-orange-500"
          >
            Inventory
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900">Edit Booth</span>
        </nav>

        <header className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            แก้ไขข้อมูลบูธ
          </h1>
          <p className="mt-2 text-slate-500">
            อัปเดตข้อมูลรายละเอียดบูธที่ {booth.name}
          </p>
        </header>

        <BoothForm
          admins={adminOptions}
          zones={zoneOptions}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
