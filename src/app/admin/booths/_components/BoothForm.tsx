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
  MousePointerClick,
  Navigation,
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
import { type BoothItem } from "./BoothConfigurator3D";

const BoothConfigurator3D = dynamic(() => import("./BoothConfigurator3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-3xl bg-slate-50 text-sm font-medium text-slate-400">
      กำลังโหลด 3D Scene...
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
    initialData?.latitude?.toString() || "",
  );
  const [lng, setLng] = useState<string>(
    initialData?.longitude?.toString() || "",
  );
  const [isLocating, setIsLocating] = useState(false);
  const [boothItems, setBoothItems] = useState<BoothItem[]>(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const raw = (initialData?.booth_items ?? "") as string;
      return raw ? (JSON.parse(raw) as BoothItem[]) : [];
    } catch {
      return [];
    }
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด");
      return;
    }

    setIsLocating(true);
    const toastId = toast.loading("กำลังค้นหาพิกัด GPS...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        toast.success("ดึงพิกัดปัจจุบันสำเร็จ", { id: toastId });
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        toast.error("ไม่สามารถดึงพิกัดได้ กรุณาตรวจสอบการอนุญาต Location", {
          id: toastId,
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

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

          {/* Section 3: Location - Professional UX Redesign */}
          <Card className="overflow-hidden rounded-[2rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-white px-8 py-6">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-orange-500" />
                ตำแหน่งบูธบนแผนที่
              </CardTitle>
              <a
                href="https://www.google.com/maps"
                target="_blank"
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-500 transition-colors hover:text-blue-600"
              >
                <ExternalLink className="h-3 w-3" />
                ค้นหาพิกัด
              </a>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col gap-8 md:flex-row">
                {/* Visual Map Placeholder / Interactive Preview */}
                <div className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-3xl border border-slate-100 bg-slate-100 md:aspect-square md:w-1/3">
                  {lat && lng ? (
                    <>
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight={0}
                        marginWidth={0}
                        className="pointer-events-none absolute inset-0 grayscale transition-all duration-700 group-hover:grayscale-0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng) - 0.005},${parseFloat(lat) - 0.005},${parseFloat(lng) + 0.005},${parseFloat(lat) + 0.005}&layer=mapnik&marker=${lat},${lng}`}
                      />
                      {/* We overlay a div to block pointer events to the iframe, so it's purely visual */}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200/50 text-slate-400">
                      <MapPin className="mb-2 h-8 w-8 opacity-50" />
                      <span className="text-[11px] font-bold tracking-widest uppercase">
                        No Location
                      </span>
                    </div>
                  )}
                  <div className="group-hover:backdrop-blur-0 absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[1px] transition-all">
                    <div className="mb-2 flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-white text-orange-500 shadow-xl">
                      <MapPin className="h-6 w-6 fill-current" />
                    </div>
                    <p className="rounded-lg bg-white/80 px-2 py-1 text-[10px] font-black tracking-tighter text-slate-500 uppercase shadow-sm">
                      Pin Preview
                    </p>
                  </div>
                </div>

                {/* Input Inputs */}
                <div className="flex-1 space-y-5">
                  <p className="mb-2 text-xs leading-relaxed text-slate-400">
                    ระบุพิกัดเพื่อให้ลูกค้าค้นหาบูธผ่านระบบแผนที่ได้แม่นยำขึ้น
                    <br />{" "}
                    <span className="font-medium text-orange-500">
                      * แนะนำให้คัดลอกจาก Google Maps
                      (คลิกขวาที่จุดแล้วเลือกพิกัด)
                    </span>
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        className="w-full gap-2 rounded-xl border-orange-200 bg-orange-50/30 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Navigation className="h-4 w-4" />
                        {isLocating
                          ? "กำลังค้นหาพิกัด..."
                          : "ดึงพิกัดปัจจุบันของฉัน (Auto-detect)"}
                      </Button>
                    </div>
                    <Input
                      label="ละติจูด (Lat)"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="13.7563..."
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="rounded-xl border-slate-100"
                      prefix={
                        <MousePointerClick className="h-4 w-4 text-slate-300" />
                      }
                    />
                    <Input
                      label="ลองจิจูด (Long)"
                      name="longitude"
                      type="number"
                      step="any"
                      placeholder="100.5018..."
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="rounded-xl border-slate-100"
                      prefix={
                        <MousePointerClick className="h-4 w-4 text-slate-300" />
                      }
                    />
                  </div>

                  <div className="rounded-2xl border border-orange-100/50 bg-orange-50/50 p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 shrink-0 text-orange-400" />
                      <p className="text-[11px] leading-normal text-orange-700/80">
                        พิกัดนี้จะถูกนำไปใช้ในระบบ{" "}
                        <strong>Street View (360 Viewer)</strong>
                        เพื่อให้ผู้เช่าเห็นทัศนียภาพรอบๆ บูธก่อนตัดสินใจจอง
                      </p>
                    </div>
                  </div>
                </div>
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
