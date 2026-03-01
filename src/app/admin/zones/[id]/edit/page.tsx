import { notFound } from "next/navigation";
import { db } from "@/server/db";
import ZoneForm from "../../_components/ZoneForm";

interface EditZonePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditZonePage({ params }: EditZonePageProps) {
  const { id } = await params;
  const zone = await db.zone.findUnique({
    where: { id },
    select: { id: true, name: true, description: true, color_code: true },
  });

  if (!zone) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ZoneForm initialData={zone} />
    </div>
  );
}
