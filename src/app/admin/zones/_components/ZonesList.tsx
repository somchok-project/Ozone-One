"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, AlertTriangle, Layers } from "lucide-react";
import { toast } from "sonner";
import { deleteZoneAction } from "../actions";

interface Zone {
  id: string;
  name: string;
  description: string | null;
  color_code: string | null;
  _count: { booths: number };
}

interface ZonesListProps {
  zones: Zone[];
}

export default function ZonesList({ zones }: ZonesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      const toastId = toast.loading("กำลังลบโซน...");
      const res = await deleteZoneAction(id);
      if (res.success) {
        toast.success("ลบโซนเรียบร้อยแล้ว", { id: toastId });
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด", { id: toastId });
      }
      setDeleteId(null);
    });
  }

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 text-center shadow-sm ring-1 ring-slate-100">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Layers className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-lg font-bold text-slate-700">ยังไม่มีโซนในระบบ</p>
        <p className="mt-1 text-sm text-slate-400">สร้างโซนแรกของคุณเพื่อจัดกลุ่มบูธ</p>
        <Link
          href="/admin/zones/new"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          + เพิ่มโซนใหม่
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 transition hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
          >
            {/* Color bar */}
            <div
              className="h-2 w-full"
              style={{ backgroundColor: zone.color_code ?? "#f97316" }}
            />

            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: `${zone.color_code ?? "#f97316"}22`,
                    }}
                  >
                    <Layers
                      className="h-5 w-5"
                      style={{ color: zone.color_code ?? "#f97316" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{zone.name}</h3>
                    <p className="text-xs text-slate-400">
                      {zone._count.booths} บูธ
                    </p>
                  </div>
                </div>

                {/* Color swatch */}
                {zone.color_code && (
                  <div
                    className="h-5 w-5 rounded-full border border-white shadow-sm ring-1 ring-slate-200"
                    style={{ backgroundColor: zone.color_code }}
                    title={zone.color_code}
                  />
                )}
              </div>

              {zone.description && (
                <p className="mb-4 line-clamp-2 text-xs text-slate-500">
                  {zone.description}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/zones/${zone.id}/edit`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
                >
                  <Edit size={13} />
                  แก้ไข
                </Link>
                <button
                  onClick={() => setDeleteId(zone.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-center text-xl font-black text-slate-900">
              ยืนยันการลบโซน?
            </h3>
            <p className="mb-8 text-center text-sm text-slate-500">
              บูธที่อยู่ในโซนนี้จะถูกถอดออกจากโซน
              แต่ยังคงอยู่ในระบบ
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isPending}
                className="h-12 w-full rounded-2xl bg-red-500 font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {isPending ? "กำลังลบ..." : "ลบโซนนี้"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                disabled={isPending}
                className="h-12 w-full rounded-2xl border border-slate-200 font-bold text-slate-500 transition hover:bg-slate-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
