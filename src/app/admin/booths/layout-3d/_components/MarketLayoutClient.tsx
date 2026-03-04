"use client";

import { useState, useCallback, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, Save, MapPinned, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { updateBoothPositionAction } from "../../actions";
import type { BoothPositionData } from "../../_components/MarketLayout3D";

const MarketLayout3D = dynamic(() => import("../../_components/MarketLayout3D"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100vh-10rem)] w-full flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-100 bg-slate-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <span className="text-sm font-semibold tracking-wide text-slate-400">
                กำลังโหลด 3D Layout...
            </span>
        </div>
    ),
});

interface PendingChange {
    boothId: string;
    boothName: string;
    position: { x: number; y: number; z: number };
    rotationY: number;
}

export default function MarketLayoutClient({
    booths: initialBooths,
}: {
    booths: BoothPositionData[];
}) {
    const [booths, setBooths] = useState(initialBooths);
    const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(
        new Map(),
    );
    const [isPending, startTransition] = useTransition();

    const handlePositionChange = useCallback(
        (
            boothId: string,
            position: { x: number; y: number; z: number },
            rotationY: number,
        ) => {
            // Update local state for live preview
            setBooths((prev) =>
                prev.map((b) =>
                    b.id === boothId
                        ? {
                            ...b,
                            position_x: position.x,
                            position_y: position.y,
                            position_z: position.z,
                            rotation_y: rotationY,
                        }
                        : b,
                ),
            );

            const booth = initialBooths.find((b) => b.id === boothId);
            setPendingChanges((prev) => {
                const next = new Map(prev);
                next.set(boothId, {
                    boothId,
                    boothName: booth?.name ?? boothId,
                    position,
                    rotationY,
                });
                return next;
            });
        },
        [initialBooths],
    );

    const handleSaveAll = useCallback(() => {
        if (pendingChanges.size === 0) return;

        startTransition(async () => {
            let successCount = 0;
            let errorCount = 0;

            for (const change of pendingChanges.values()) {
                const res = await updateBoothPositionAction(change.boothId, {
                    position_x: change.position.x,
                    position_y: change.position.y,
                    position_z: change.position.z,
                    rotation_y: change.rotationY,
                });
                if (res.success) successCount++;
                else errorCount++;
            }

            if (errorCount === 0) {
                toast.success(`บันทึกตำแหน่ง ${successCount} บูธ สำเร็จ`);
                setPendingChanges(new Map());
            } else {
                toast.error(`เกิดข้อผิดพลาด ${errorCount} รายการ`);
            }
        });
    }, [pendingChanges]);

    const handleUndo = useCallback(() => {
        setBooths(initialBooths);
        setPendingChanges(new Map());
        toast.info("คืนค่าตำแหน่งเดิมทั้งหมด");
    }, [initialBooths]);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="mx-auto max-w-[1400px] px-6 py-6">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            href="/admin/booths"
                            className="group mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-orange-600"
                        >
                            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
                            กลับหน้าจัดการบูธ
                        </Link>
                        <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-slate-900">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                                <MapPinned className="h-5 w-5" />
                            </div>
                            จัดผังตลาด 3D
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            ลากบูธเพื่อจัดตำแหน่งในแผนผังตลาด •{" "}
                            <span className="font-semibold text-orange-600">
                                {pendingChanges.size} รายการยังไม่บันทึก
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleUndo}
                            disabled={pendingChanges.size === 0}
                            className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40"
                        >
                            <Undo2 className="h-4 w-4" />
                            คืนค่าเดิม
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={pendingChanges.size === 0 || isPending}
                            className="flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-orange-200 active:scale-[0.98] disabled:opacity-40"
                        >
                            <Save className="h-4 w-4" />
                            {isPending
                                ? "กำลังบันทึก..."
                                : `บันทึก (${pendingChanges.size})`}
                        </button>
                    </div>
                </div>

                {/* 3D Canvas */}
                <MarketLayout3D
                    booths={booths}
                    onPositionChange={handlePositionChange}
                    height="calc(100vh - 12rem)"
                />
            </div>
        </div>
    );
}
