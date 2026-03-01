"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Layers, ChevronLeft, Palette } from "lucide-react";
import { toast } from "sonner";
import { createZoneAction, updateZoneAction } from "../actions";

const PRESET_COLORS = [
  "#f97316", "#ef4444", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b",
  "#6366f1", "#84cc16",
];

interface ZoneFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    color_code: string | null;
  };
}

export default function ZoneForm({ initialData }: ZoneFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;
  const [color, setColor] = useState(initialData?.color_code ?? "#f97316");

  async function handleSubmit(formData: FormData) {
    formData.set("color_code", color);
    startTransition(async () => {
      const res = isEditing
        ? await updateZoneAction(initialData?.id ?? "", formData)
        : await createZoneAction(formData);

      if (res.success) {
        toast.success(isEditing ? "บันทึกข้อมูลโซนสำเร็จ" : "สร้างโซนใหม่สำเร็จ");
        router.push("/admin/zones");
        router.refresh();
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-1 -ml-1 flex items-center gap-1 text-sm text-slate-400 hover:text-orange-500"
          >
            <ChevronLeft size={16} />
            ย้อนกลับ
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {isEditing ? "แก้ไขโซน" : "เพิ่มโซนใหม่"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-900 px-8 text-sm font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          {isPending ? "กำลังบันทึก..." : "บันทึก"}
        </button>
      </div>

      {/* Form card */}
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
        <div className="mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-orange-500" />
          <h2 className="font-bold text-slate-800">ข้อมูลโซน</h2>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              ชื่อโซน <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              required
              defaultValue={initialData?.name}
              placeholder="เช่น โซนอาหาร, โซนแฟชั่น"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              คำอธิบาย (ไม่บังคับ)
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={initialData?.description ?? ""}
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับโซนนี้"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Color */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Palette size={14} className="text-slate-400" />
              สีประจำโซน (Color Code)
            </label>
            {/* Preset swatches */}
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition hover:scale-110 ${
                    color === c ? "border-slate-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-16 cursor-pointer rounded-xl border border-slate-200 p-1"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-36 rounded-xl border border-slate-200 px-4 py-2 text-sm font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              <div
                className="h-10 w-10 rounded-xl border border-slate-100"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
