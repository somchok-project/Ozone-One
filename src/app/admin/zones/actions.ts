"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getZones(params?: { q?: string }) {
  const query = params?.q ?? "";
  return db.zone.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {},
    include: { _count: { select: { booths: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createZoneAction(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const color_code = (formData.get("color_code") as string)?.trim() || null;

    if (!name) return { success: false, error: "กรุณากรอกชื่อโซน" };

    await db.zone.create({ data: { name, description, color_code } });
    revalidatePath("/admin/zones");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างโซน" };
  }
}

export async function updateZoneAction(id: string, formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const color_code = (formData.get("color_code") as string)?.trim() || null;

    if (!name) return { success: false, error: "กรุณากรอกชื่อโซน" };

    await db.zone.update({ where: { id }, data: { name, description, color_code } });
    revalidatePath("/admin/zones");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function deleteZoneAction(id: string) {
  try {
    // Detach booths from this zone first (set zone_id null via onDelete:SetNull is done by Prisma)
    await db.zone.delete({ where: { id } });
    revalidatePath("/admin/zones");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "ไม่สามารถลบโซนได้ (อาจมีบูธที่ใช้งานอยู่)" };
  }
}
