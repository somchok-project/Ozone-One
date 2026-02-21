"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

type Role = "ADMIN" | "USER";

export async function updateUserAction(id: string, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone_number = formData.get("phone_number") as string;
        const role = formData.get("role") as Role;

        if (!name || !email || !role) {
            return { success: false, error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" };
        }

        await db.user.update({
            where: { id },
            data: {
                name,
                email,
                phone_number: phone_number || null,
                role,
            },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
    }
}
