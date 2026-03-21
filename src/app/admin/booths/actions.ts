"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { uploadToMinio, deleteFromMinio } from "@/lib/minio";

interface RawBoothItem {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color?: string;
}

function parseBoothItems(raw: string): RawBoothItem[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RawBoothItem[]) : [];
  } catch {
    return [];
  }
}

async function saveBoothItems(boothId: string, items: RawBoothItem[]) {
  // Replace all items for this booth atomically
  await db.boothItem.deleteMany({ where: { booth_id: boothId } });
  if (items.length === 0) return;
  await db.boothItem.createMany({
    data: items.map((item) => ({
      booth_id: boothId,
      item_type: item.type,
      color: item.color ?? null,
      position_x: item.position[0],
      position_y: item.position[1],
      position_z: item.position[2],
      rotation_x: item.rotation[0],
      rotation_y: item.rotation[1],
      rotation_z: item.rotation[2],
    })),
  });
}

export async function getBooths(params?: { q?: string; status?: string }) {
  const query = params?.q ?? "";
  const statusFilter = params?.status ?? "all";
  const now = new Date();

  const activeStatuses = ["CONFIRMED", "PENDING"] as const;

  // Covers today
  const activeTodayFilter = {
    booking_status: { in: [...activeStatuses] },
    start_date: { lte: now },
    end_date: { gte: now },
  };

  // Any future-or-current active booking
  const futureFilter = {
    booking_status: { in: [...activeStatuses] },
    end_date: { gte: now },
  };

  let statusWhere = {};
  if (statusFilter === "available") {
    statusWhere = { is_available: true, bookings: { none: activeTodayFilter } };
  } else if (statusFilter === "occupied") {
    statusWhere = { is_available: true, bookings: { some: activeTodayFilter } };
  } else if (statusFilter === "closed") {
    statusWhere = { is_available: false };
  }

  const booths = await db.booth.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { dimension: { contains: query, mode: "insensitive" } },
      ],
      ...statusWhere,
    },
    include: {
      user: true,
      zone: true,
      _count: {
        select: {
          bookings: { where: activeTodayFilter },
        },
      },
      // Active booking today (to show end date)
      bookings: {
        where: activeTodayFilter,
        select: { id: true, start_date: true, end_date: true, booking_status: true, user: { select: { name: true } } },
        orderBy: { start_date: "asc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  // For each booth also fetch: upcoming booking count + next booking start date
  const boothIds = booths.map((b) => b.id);

  const [upcomingCounts, nextBookings] = await Promise.all([
    // Count all future active bookings per booth
    db.booking.groupBy({
      by: ["booth_id"],
      where: { booth_id: { in: boothIds }, ...futureFilter },
      _count: { _all: true },
    }),
    // Next upcoming booking that starts AFTER now (i.e. not active today, but coming up)
    db.booking.findMany({
      where: {
        booth_id: { in: boothIds },
        booking_status: { in: [...activeStatuses] },
        start_date: { gt: now },
      },
      select: { booth_id: true, start_date: true, end_date: true },
      orderBy: { start_date: "asc" },
      distinct: ["booth_id"],
    }),
  ]);

  const upcomingMap = new Map(upcomingCounts.map((r) => [r.booth_id, r._count._all]));
  const nextBookingMap = new Map(nextBookings.map((r) => [r.booth_id, r]));

  return booths.map((b) => ({
    ...b,
    hasActiveBooking: b._count.bookings > 0,
    activeBooking: b.bookings[0] ?? null,
    upcomingCount: upcomingMap.get(b.id) ?? 0,
    nextBooking: nextBookingMap.get(b.id) ?? null,
  }));
}

async function processBoothImages(boothId: string, formData: FormData) {
  // Handle deletions
  const deletedImagesRaw = formData.get("deleted_images") as string;
  if (deletedImagesRaw) {
    try {
      const deletedImageIds = JSON.parse(deletedImagesRaw) as string[];
      if (Array.isArray(deletedImageIds) && deletedImageIds.length > 0) {
        const imagesToDelete = await db.image.findMany({
          where: { id: { in: deletedImageIds }, booth_id: boothId }
        });

        for (const img of imagesToDelete) {
          try {
            const url = new URL(img.path);
            const pathParts = url.pathname.split('/').filter(Boolean);
            pathParts.shift(); // remove bucket name
            const objectName = pathParts.join('/');
            await deleteFromMinio(objectName);
          } catch (e) {
            console.error("Failed to delete from Minio:", img.path, e);
          }
        }

        await db.image.deleteMany({
          where: { id: { in: deletedImageIds }, booth_id: boothId }
        });
      }
    } catch (e) {
      console.error("Error processing deleted images:", e);
    }
  }

  // Handle new uploads
  const newImages = formData.getAll("new_images") as File[];
  for (const file of newImages) {
    if (file && file.size > 0 && file.name !== "undefined") {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const objectName = `booths/${boothId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const imageUrl = await uploadToMinio(objectName, buffer, file.type || "application/octet-stream");

        await db.image.create({
          data: {
            booth_id: boothId,
            path: imageUrl,
          }
        });
      } catch (e) {
        console.error("Failed to upload image:", file.name, e);
      }
    }
  }
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
    const boothItemsRaw = (formData.get("booth_items") as string) || "[]";

    if (!name || isNaN(price) || !user_id || !dimension) {
      return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง" };
    }

    const booth = await db.booth.create({
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

    await saveBoothItems(booth.id, parseBoothItems(boothItemsRaw));
    await processBoothImages(booth.id, formData);

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
    const boothItemsRaw = (formData.get("booth_items") as string) || "[]";

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

    await saveBoothItems(id, parseBoothItems(boothItemsRaw));
    await processBoothImages(id, formData);

    revalidatePath("/admin/booths");
    return { success: true };
  } catch (error) {
    console.error("Error updating booth:", error);
    return { success: false, error: "Failed to update booth" };
  }
}

// ─── 3D Layout helpers ────────────────────────────────────────────────────────

export async function getBoothPositions() {
  return db.booth.findMany({
    select: {
      id: true,
      name: true,
      dimension: true,
      is_available: true,
      position_x: true,
      position_y: true,
      position_z: true,
      rotation_y: true,
      scale: true,
      zone: { select: { id: true, name: true, color_code: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function updateBoothPositionAction(
  id: string,
  data: {
    position_x: number;
    position_y: number;
    position_z: number;
    rotation_y: number;
  },
) {
  try {
    await db.booth.update({
      where: { id },
      data: {
        position_x: data.position_x,
        position_y: data.position_y,
        position_z: data.position_z,
        rotation_y: data.rotation_y,
      },
    });
    revalidatePath("/admin/booths");
    return { success: true };
  } catch (error) {
    console.error("Error updating booth position:", error);
    return { success: false, error: "Failed to update booth position" };
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
