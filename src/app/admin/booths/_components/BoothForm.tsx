"use client";

import { useTransition, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Save,
  MapPin,
  MapPinned,
  Ruler,
  Info,
  DollarSign,
  Camera,
  ChevronLeft,
  Store,
  Settings2,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
} from "@/components/ui";
import { createBoothAction, updateBoothAction } from "../actions";
import { type BoothItem } from "@/constants/boothItems";

// ─── Dynamic Imports ────────────────────────────────────────────────────────

const MarketLayout3D = dynamic(() => import("./MarketLayout3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-100 bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
      <span className="text-sm font-semibold tracking-wide text-slate-400">
        กำลังโหลด 3D Market Layout...
      </span>
    </div>
  ),
});

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-[2rem] bg-slate-100/50">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
        <MapPin className="h-4 w-4 animate-bounce text-orange-400" />
        กำลังโหลดแผนที่ตลาด Ozone One...
      </div>
    </div>
  ),
});

// ─── Interfaces ─────────────────────────────────────────────────────────────

// กำหนด Type ให้ชัดเจนแทนการใช้ any
export interface BoothInitialData {
  id: string;
  name?: string;
  dimension?: string;
  price?: number;
  latitude?: number | string | null;
  longitude?: number | string | null;
  booth_items?: string | BoothItem[] | null;
  is_available?: boolean;
  zone_id?: string | null;
  user_id?: string | null;
  images?: { id: string; path: string }[];
  // 3D position fields
  position_x?: number | null;
  position_y?: number | null;
  position_z?: number | null;
  rotation_y?: number | null;
}

interface BoothFormProps {
  admins: { value: string; label: string }[];
  zones: { value: string; label: string }[];
  initialData?: BoothInitialData | null;
  /** All booths for the market layout 3D (used to show context in single-booth mode) */
  allBooths?: import("./MarketLayout3D").BoothPositionData[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BoothForm({ admins, zones, initialData, allBooths = [] }: BoothFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData?.id;

  const [lat, setLat] = useState<string>(
    initialData?.latitude ? String(initialData.latitude) : "",
  );
  const [lng, setLng] = useState<string>(
    initialData?.longitude ? String(initialData.longitude) : "",
  );

  const [boothItems, setBoothItems] = useState<BoothItem[]>(() => {
    if (!initialData?.booth_items) return [];

    // เช็คกรณีข้อมูลมาเป็น Array อยู่แล้ว (Prisma Relation)
    if (Array.isArray(initialData.booth_items)) {
      return initialData.booth_items;
    }

    // เช็คกรณีเป็น JSON String
    if (typeof initialData.booth_items === "string") {
      try {
        return JSON.parse(initialData.booth_items) as BoothItem[];
      } catch {
        return [];
      }
    }

    return [];
  });

  const [dimension, setDimension] = useState<string>(
    initialData?.dimension ?? "3x3",
  );

  // 3D booth position
  const [posX, setPosX] = useState<number>(Number(initialData?.position_x ?? 0));
  const [posY, setPosY] = useState<number>(Number(initialData?.position_y ?? 0));
  const [posZ, setPosZ] = useState<number>(Number(initialData?.position_z ?? 0));
  const [rotY, setRotY] = useState<number>(Number(initialData?.rotation_y ?? 0));

  // Multiple Image state
  const [existingImages, setExistingImages] = useState<{ id: string; path: string }[]>(
    initialData?.images ?? []
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setNewImages((prev) => [...prev, ...files]);
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviewUrls(prev => {
      const url = prev[indexToRemove];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const removeExistingImage = (imageId: string) => {
    setDeletedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const statusOptions = [
    { value: "true", label: "ว่าง (พร้อมให้เช่า)" },
    { value: "false", label: "ไม่ว่าง (ปิดปรับปรุง/จองแล้ว)" },
  ];

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      // Ensure 3D items are explicitly set in form data before submit
      formData.set("booth_items", JSON.stringify(boothItems));

      // Append new images and deleted image IDs
      newImages.forEach(file => {
        formData.append("new_images", file);
      });
      if (deletedImageIds.length > 0) {
        formData.set("deleted_images", JSON.stringify(deletedImageIds));
      }

      let res;
      if (isEditing && initialData?.id) {
        res = await updateBoothAction(initialData.id, formData);
      } else {
        res = await createBoothAction(formData);
      }

      if (res.success) {
        toast.success(isEditing ? "อัปเดตข้อมูลสำเร็จ" : "สร้างบูธใหม่สำเร็จ");
        router.push("/admin/booths");
        router.refresh();
      } else {
        toast.error(res?.error ?? "เกิดข้อผิดพลาดในการบันทึก");
      }
    });
  }

  // การจัดการค่าเริ่มต้นแบบปลอดภัย
  const defaultIsAvailable = initialData?.is_available !== undefined
    ? String(initialData.is_available)
    : "true";

  return (
    <form action={handleSubmit} className="mx-auto max-w-6xl space-y-8 pb-24">
      {/* Hidden lat/lng for form submission */}
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />
      <input type="hidden" name="position_x" value={posX} />
      <input type="hidden" name="position_y" value={posY} />
      <input type="hidden" name="position_z" value={posZ} />
      <input type="hidden" name="rotation_y" value={rotY} />

      {/* ─── Header & Action Bar ─── */}
      <div className="sticky top-0 z-30 flex flex-col gap-4 bg-[#FAFAFA]/80 py-4 backdrop-blur-md border-b border-slate-100 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="group mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-orange-600"
          >
            <ChevronLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            ย้อนกลับ
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {isEditing ? "แก้ไขข้อมูลบูธ" : "สร้างบูธใหม่"}
          </h1>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="group relative h-12 gap-2 overflow-hidden rounded-2xl bg-slate-900 px-8 font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-[1.02] hover:bg-orange-600 hover:shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          <Save className="h-4 w-4" />
          {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </Button>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Core Info & Map */}
        <div className="space-y-8 lg:col-span-2">
          {/* Section 1: Basic Info */}
          <Card className="overflow-hidden rounded-[2rem] border border-slate-100/60 bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardHeader className="border-b border-slate-50/50 bg-slate-50/30 px-8 py-5">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Info className="h-4 w-4" />
                </div>
                รายละเอียดทั่วไป
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <Input
                label="ชื่อบูธ / ล็อค"
                name="name"
                placeholder="เช่น Zone A - ล็อค 01"
                required
                defaultValue={initialData?.name ?? ""}
                prefix={<Store className="h-4 w-4 text-slate-400" />}
                className="rounded-xl"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="ขนาดพื้นที่"
                  name="dimension"
                  placeholder="เช่น 3x3 m"
                  required
                  value={dimension}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDimension(e.target.value)}
                  prefix={<Ruler className="h-4 w-4 text-slate-400" />}
                  className="rounded-xl"
                />
                <Input
                  label="ราคาเช่าต่อวัน"
                  name="price"
                  type="number"
                  required
                  defaultValue={initialData?.price ?? ""}
                  prefix={<DollarSign className="h-4 w-4 text-slate-400" />}
                  suffix={<span className="mr-2 text-xs font-bold text-slate-400">บาท</span>}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Interactive Location Map */}
          <Card className="overflow-hidden rounded-[2rem] border border-slate-100/60 bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardHeader className="flex flex-col gap-1 border-b border-slate-50/50 bg-slate-50/30 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <MapPin className="h-4 w-4" />
                </div>
                ตำแหน่งในตลาด
              </CardTitle>
              {lat && lng && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> ปักหมุดแล้ว
                </span>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="group relative h-[420px] w-full overflow-hidden rounded-[1.5rem] shadow-inner ring-1 ring-slate-200/50">
                <MapPicker
                  lat={lat}
                  lng={lng}
                  onChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                />
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                <MapPin className="h-3 w-3" />
                {lat && lng
                  ? `พิกัดปัจจุบัน: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`
                  : "กรุณาคลิกบนแผนที่เพื่อระบุตำแหน่งบูธ"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings & Tips */}
        <div className="space-y-6">
          {/* Multiple Image Upload */}
          <Card className="overflow-hidden rounded-[2rem] border border-slate-100/60 bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardHeader className="border-b border-slate-50/50 bg-slate-50/30 px-6 py-5">
              <CardTitle className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100/50 text-blue-600">
                  <Camera className="h-3.5 w-3.5" />
                </div>
                รูปภาพบูธ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-col gap-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-6 text-slate-500 hover:bg-slate-100 transition-colors">
                  <Camera className="h-6 w-6 text-slate-400" />
                  <span className="text-xs font-semibold">อัปโหลดรูปภาพเพิ่มเติม</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                
                {/* Image Previews */}
                {(existingImages.length > 0 || previewUrls.length > 0) && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {/* Existing Images */}
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.path} alt="Booth Image" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur transition-colors hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* New Images */}
                    {previewUrls.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`New Booth Image ${idx}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur transition-colors hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[2rem] border border-slate-100/60 bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardHeader className="border-b border-slate-50/50 bg-slate-50/30 px-6 py-5">
              <CardTitle className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200/50 text-slate-600">
                  <Settings2 className="h-3.5 w-3.5" />
                </div>
                การตั้งค่าระบบ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <Select
                label="สถานะการใช้งาน"
                name="is_available"
                options={statusOptions}
                defaultValue={defaultIsAvailable}
                required
              />
              <Select
                label="โซน"
                name="zone_id"
                options={[{ value: "", label: "ไม่มีโซน (อิสระ)" }, ...zones]}
                defaultValue={initialData?.zone_id ?? ""}
              />
              <Select
                label="ผู้รับผิดชอบ (Admin)"
                name="user_id"
                options={admins}
                required
                defaultValue={initialData?.user_id ?? ""}
              />
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ─── 3D Market Position (Full Width) ─── */}
      {(allBooths.length > 0 || !isEditing) && (() => {
        // For adding a new booth, inject a phantom booth so the admin can drag it
        const NEW_BOOTH_ID = "__new_booth__";
        const currentBoothId = isEditing ? initialData?.id : NEW_BOOTH_ID;

        // Find a clear position for the new booth (offset from existing ones)
        const existingXs = allBooths.map(b => b.position_x ?? 0);
        const existingZs = allBooths.map(b => b.position_z ?? 0);
        const spawnX = allBooths.length > 0 ? Math.max(...existingXs) + 5 : 0;
        const spawnZ = allBooths.length > 0 ? Math.min(...existingZs) - 3 : 0;

        const boothsForLayout = isEditing
          ? allBooths
          : [
            ...allBooths,
            {
              id: NEW_BOOTH_ID,
              name: "⭐ บูธใหม่",
              dimension: dimension,
              is_available: true,
              position_x: posX !== 0 ? posX : spawnX,
              position_y: posY,
              position_z: posZ !== 0 ? posZ : spawnZ,
              rotation_y: rotY,
              scale: 1,
              zone: null,
            },
          ];

        return (
          <Card className="mt-8 overflow-hidden rounded-[2rem] border border-slate-100/60 bg-white shadow-sm ring-1 ring-slate-900/5">
            <CardHeader className="flex flex-col gap-1 border-b border-slate-50 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                  <MapPinned className="h-4 w-4" />
                </div>
                ตำแหน่งบูธในตลาด (3D)
              </CardTitle>
              <span className="text-xs font-medium text-slate-400">
                ลากบูธเพื่อจัดตำแหน่งในแผนผังตลาด
              </span>
            </CardHeader>
            <CardContent className="p-0 sm:p-2 sm:pb-2">
              <MarketLayout3D
                booths={boothsForLayout}
                highlightBoothId={currentBoothId}
                singleBoothMode
                height="420px"
                onPositionChange={(_id, pos, rot) => {
                  setPosX(pos.x);
                  setPosY(pos.y);
                  setPosZ(pos.z);
                  setRotY(rot);
                }}
              />
            </CardContent>
          </Card>
        );
      })()}


    </form>
  );
}