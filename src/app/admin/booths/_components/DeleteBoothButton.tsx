"use client";

import { useTransition } from "react";
import { Trash } from "lucide-react";
import { deleteBoothAction } from "../actions";

export function DeleteBoothButton({ boothId }: { boothId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบูธนี้? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบด้วย")) {
            startTransition(async () => {
                const res = await deleteBoothAction(boothId);
                if (!res.success) {
                    alert("เกิดข้อผิดพลาดในการลบบูธ");
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm hover:bg-red-50 text-red-600 transition-colors cursor-pointer ${isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
            title="ลบบูธ"
        >
            <Trash className="h-4 w-4" />
        </button>
    );
}
