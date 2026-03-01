"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function getBooths(params?: { q?: string; status?: string }) {
  const query = params?.q || "";
  const statusFilter = params?.status || "all";

  const booths = await db.booth.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { dimension: { contains: query, mode: "insensitive" } },
      ],
      ...(statusFilter !== "all"
        ? { is_available: statusFilter === "available" }
        : {}),
    },
    include: {
      user: true,
      zone: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return booths;
}
export async function createBoothAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const is_available = formData.get("is_available") === "true";
    const user_id = formData.get("user_id") as string;
    const zone_id = formData.get("zone_id") as string;
    const dimension = formData.get("dimension") as string;

    const latStr = formData.get("latitude") as string;
    const lngStr = formData.get("longitude") as string;
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lngStr ? parseFloat(lngStr) : null;

    // 3D Config
    const position_x = parseFloat(formData.get("position_x") as string) || 0;
    const position_y = parseFloat(formData.get("position_y") as string) || 0;
    const position_z = parseFloat(formData.get("position_z") as string) || 0;
    const rotation_x = parseFloat(formData.get("rotation_x") as string) || 0;
    const rotation_y = parseFloat(formData.get("rotation_y") as string) || 0;
    const rotation_z = parseFloat(formData.get("rotation_z") as string) || 0;
    const scale = parseFloat(formData.get("scale") as string) || 1;
    const model_url = (formData.get("model_url") as string) || null;

    if (!name || isNaN(price) || !user_id || !dimension) {
      return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง" };
    }

    await db.booth.create({
      data: {
        name,
        price,
        is_available,
        user_id,
        zone_id: zone_id || null,
        dimension,
        ...(latitude !== null && { latitude }),
        ...(longitude !== null && { longitude }),
        position_x,
        position_y,
        position_z,
        rotation_x,
        rotation_y,
        rotation_z,
        scale,
        model_url,
      },
    });

    revalidatePath("/admin/booths");
    return { success: true };
  } catch (error) {
    console.error("Error creating booth:", error);
    return { success: false, error: "Failed to create booth" };
  }
}

export async function updateBoothAction(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const is_available = formData.get("is_available") === "true";
    const user_id = formData.get("user_id") as string;
    const zone_id = formData.get("zone_id") as string;
    const dimension = formData.get("dimension") as string;

    const latStr = formData.get("latitude") as string;
    const lngStr = formData.get("longitude") as string;
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lngStr ? parseFloat(lngStr) : null;

    // 3D Config
    const position_x = parseFloat(formData.get("position_x") as string) || 0;
    const position_y = parseFloat(formData.get("position_y") as string) || 0;
    const position_z = parseFloat(formData.get("position_z") as string) || 0;
    const rotation_x = parseFloat(formData.get("rotation_x") as string) || 0;
    const rotation_y = parseFloat(formData.get("rotation_y") as string) || 0;
    const rotation_z = parseFloat(formData.get("rotation_z") as string) || 0;
    const scale = parseFloat(formData.get("scale") as string) || 1;
    const model_url = (formData.get("model_url") as string) || null;

    if (!name || isNaN(price) || !user_id || !dimension) {
      return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง" };
    }

    await db.booth.update({
      where: { id },
      data: {
        name,
        price,
        is_available,
        user_id,
        zone_id: zone_id || null,
        dimension,
        ...(latitude !== null && { latitude }),
        ...(longitude !== null && { longitude }),
        position_x,
        position_y,
        position_z,
        rotation_x,
        rotation_y,
        rotation_z,
        scale,
        model_url,
      },
    });

    revalidatePath("/admin/booths");
    return { success: true };
  } catch (error) {
    console.error("Error updating booth:", error);
    return { success: false, error: "Failed to update booth" };
  }
}

export async function deleteBoothAction(id: string) {
  try {
    await db.image.deleteMany({
      where: { booth_id: id },
    });

    await db.booth.delete({
      where: { id },
    });

    revalidatePath("/admin/booths");
    return { success: true };
  } catch (error) {
    console.error("Error deleting booth:", error);
    return { success: false, error: "Failed to delete booth" };
  }
}
