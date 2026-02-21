"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

type BoothType = "FREE" | "BOOKING";

export async function createBoothAction(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const type = formData.get("type") as BoothType;
        const price = parseFloat(formData.get("price") as string);
        const is_available = formData.get("is_available") === "true";
        const user_id = formData.get("user_id") as string;
        const latitude = parseFloat(formData.get("latitude") as string);
        const longitude = parseFloat(formData.get("longitude") as string);
        const dimension = formData.get("dimension") as string;

        if (!name || isNaN(price) || !user_id || isNaN(latitude) || isNaN(longitude) || !dimension) {
            return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง" };
        }

        await db.booth.create({
            data: {
                name,
                type,
                price,
                is_available,
                user_id,
                latitude,
                longitude,
                dimension,
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
        const type = formData.get("type") as BoothType;
        const price = parseFloat(formData.get("price") as string);
        const is_available = formData.get("is_available") === "true";
        const user_id = formData.get("user_id") as string;
        const latitude = parseFloat(formData.get("latitude") as string);
        const longitude = parseFloat(formData.get("longitude") as string);
        const dimension = formData.get("dimension") as string;

        if (!name || isNaN(price) || !user_id || isNaN(latitude) || isNaN(longitude) || !dimension) {
            return { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง" };
        }

        await db.booth.update({
            where: { id },
            data: {
                name,
                type,
                price,
                is_available,
                user_id,
                latitude,
                longitude,
                dimension,
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
