"use client";

import { useTransition, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Save,
  MapPin,
  Ruler,
  Info,
  DollarSign,
  Camera,
  ChevronLeft,
  ChevronRight,
  Store,
  ExternalLink,
} from "lucide-react";
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
import { type BoothItem } from "./BoothConfigurator3D";

const BoothConfigurator3D = dynamic(() => import("./BoothConfigurator3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-3xl bg-slate-50 text-sm font-medium text-slate-400">
      กำลังโหลด 3D Scene...
    </div>
  ),
});

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-3xl bg-slate-100 text-sm font-bold text-slate-400">
      กำลังโหลดแผนที่ตลาด Ozone One...
    </div>
  ),
});

interface BoothFormProps {
  admins: { value: string; label: string }[];
  zones: { value: string; label: string }[];
  initialData?: any;
}

export function BoothForm({ admins, zones, initialData }: BoothFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const [lat, setLat] = useState<string>(
    initialData?.latitude?.toString() ?? "",
  );
  const [lng, setLng] = useState<string>(
    initialData?.longitude?.toString() ?? "",
  );
  const [boothItems, setBoothItems] = useState<BoothItem[]>(() => {
    try {
      const raw = (initialData?.booth_items ?? "") as string;
      return raw ? (JSON.parse(raw) as BoothItem[]) : [];
    } catch {
      return [];
    }
  });

  const statusOptions = [
    { value: "true", label: "ว่าง (พร้อมให้เช่า)" },
    { value: "false", label: "ไม่ว่าง (ปิดปรับปรุง/จองแล้ว)" },
  ];

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = isEditing
        ? await updateBoothAction(initialData.id, formData)
        : await createBoothAction(formData);

      if (res.success) {
        router.push("/admin/booths");
        router.refresh();
      } else {
        alert(res.error || "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8 pb-20">
      {/* Hidden lat/lng — set by MapPicker */}
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />

      {/* Navigation & Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 -ml-2 h-8 gap-1 text-slate-400 hover:text-orange-600"
          >
            <ChevronLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {isEditing ? "แก้ไขข้อมูลบูธ" : "เพิ่มบูธใหม่"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="h-12 gap-2 rounded-2xl bg-slate-900 px-8 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content: 2 Columns */}
        <div className="space-y-8 lg:col-span-2">
          {/* Section 1: Basic Info */}
          <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Info className="h-5 w-5 text-orange-500" />
                รายละเอียดบูธ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <Input
                label="ชื่อบูธ / ล็อค"
                name="name"
                placeholder="เช่น Zone A - ล็อค 01"
                required
                defaultValue={initialData?.name}
                prefix={<Store className="h-4 w-4 text-slate-400" />}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="ขนาดพื้นที่"
                  name="dimension"
                  placeholder="เช่น 3x3 m"
                  required
                  defaultValue={initialData?.dimension}
                  prefix={<Ruler className="h-4 w-4 text-slate-400" />}
                />
                <Input
                  label="ราคาเช่า"
                  name="price"
                  type="number"
                  required
                  defaultValue={initialData?.price}
                  prefix={<DollarSign className="h-4 w-4 text-slate-400" />}
                  suffix={
                    <span className="mr-2 text-xs font-bold text-slate-400">
                      บาท
                    </span>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: 3D Visualization Config */}
          <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <ExternalLink className="h-5 w-5 text-purple-500" />
                การตั้งค่า 3D Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <Input
                label="3D Model URL (.glb, .gltf)"
                name="model_url"
                placeholder="https://..."
                defaultValue={initialData?.model_url}
                prefix={<ChevronRight className="h-4 w-4 text-slate-400" />}
              />

              <div className="grid gap-6 md:grid-cols-3">
                <Input
                  label="Position X"
                  name="position_x"
                  type="number"
                  step="any"
                  defaultValue={initialData?.position_x || 0}
                />
                <Input
                  label="Position Y"
                  name="position_y"
                  type="number"
                  step="any"
                  defaultValue={initialData?.position_y || 0}
                />
                <Input
                  label="Position Z"
                  name="position_z"
                  type="number"
                  step="any"
                  defaultValue={initialData?.position_z || 0}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Input
                  label="Rotation X"
                  name="rotation_x"
                  type="number"
                  step="any"
                  defaultValue={initialData?.rotation_x || 0}
                />
                <Input
                  label="Rotation Y"
                  name="rotation_y"
                  type="number"
                  step="any"
                  defaultValue={initialData?.rotation_y || 0}
                />
                <Input
                  label="Rotation Z"
                  name="rotation_z"
                  type="number"
                  step="any"
                  defaultValue={initialData?.rotation_z || 0}
                />
              </div>

              <Input
                label="Scale"
                name="scale"
                type="number"
                step="any"
                defaultValue={initialData?.scale || 1}
              />
            </CardContent>
          </Card>

          {/* Section 3: Interactive Location Map */}
          <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-orange-500" />
                ตำแหน่งบูธในตลาด Ozone One
              </CardTitle>
              <p className="mt-1 text-sm text-slate-400">
                เลื่อนแผนที่และคลิกเพื่อปักหมุดตำแหน่งของบูธนี้
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative h-[420px] w-full overflow-hidden rounded-3xl shadow-inner">
                <MapPicker
                  lat={lat}
                  lng={lng}
                  onChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between px-1">
                <p className="font-mono text-xs text-slate-400">
                  {lat && lng
                    ? `พิกัด: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`
                    : "ยังไม่ได้เลือกพิกัด"}
                </p>
                {lat && lng && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    ✅ ปักหมุดเรียบร้อย
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Status & Admin Settings */}
        <div className="space-y-8">
          <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0_0,0.04)]">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
              <CardTitle className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                การจัดการ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <Select
                label="สถานะการใช้งาน"
                name="is_available"
                options={statusOptions}
                defaultValue={initialData?.is_available?.toString() || "true"}
                required
              />
              <Select
                label="โกรฟ / โซน"
                name="zone_id"
                options={[{ value: "", label: "ไม่มีโซน" }, ...zones]}
                defaultValue={initialData?.zone_id || ""}
              />
              <Select
                label="ผู้รับผิดชอบ (Admin)"
                name="user_id"
                options={admins}
                required
                defaultValue={initialData?.user_id}
              />
            </CardContent>
          </Card>

          {/* Quick info card */}
          <Card className="overflow-hidden rounded-[2rem] border-none bg-gradient-to-br from-orange-50 to-amber-50 shadow-none ring-1 ring-orange-100">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Camera className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-700">3D Booth Configurator</span>
              </div>
              <p className="text-xs leading-relaxed text-orange-700/70">
                จัด Layout เฟอร์นิเจอร์ภายในบูธด้วย 3D Canvas ด้านล่าง
                เพิ่มโต๊ะ เก้าอี้ ราวแขวน หรือชั้นวางได้ตามต้องการ
                แล้วกด <strong>บันทึก Layout</strong> เพื่อบันทึก
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── 3D Booth Configurator (full width) ─── */}
      <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Camera className="h-5 w-5 text-orange-500" />
            จัด Layout บูธ 3D (Booth Configurator)
          </CardTitle>
          <p className="mt-1 text-xs text-slate-400">
            ลากวางเฟอร์นิเจอร์ภายในบูธ — คลิกเพื่อเลือก, ลากเพื่อขยับ, กด Rotate เพื่อหมุน
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <BoothConfigurator3D
            initialItems={boothItems}
            onChange={setBoothItems}
            inputName="booth_items"
          />
        </CardContent>
      </Card>
    </form>
  );
}
