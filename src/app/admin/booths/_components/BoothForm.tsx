"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, MapPin, Ruler, Info, DollarSign, Camera, ChevronLeft, Store, ExternalLink, MousePointerClick, Navigation } from "lucide-react";
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

interface BoothFormProps {
    admins: { value: string; label: string }[];
    initialData?: any; 
}

export function BoothForm({ admins, initialData }: BoothFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData;

    const [lat, setLat] = useState<string>(initialData?.latitude?.toString() || "");
    const [lng, setLng] = useState<string>(initialData?.longitude?.toString() || "");
    const [isLocating, setIsLocating] = useState(false);

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
                toast.error("ไม่สามารถดึงพิกัดได้ กรุณาตรวจสอบการอนุญาต Location", { id: toastId });
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
        <form action={handleSubmit} className="space-y-8">
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isEditing ? "แก้ไขข้อมูลบูธ" : "เพิ่มบูธใหม่"}
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        type="submit" 
                        disabled={isPending} 
                        className="h-12 px-8 rounded-2xl bg-slate-900 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content: 2 Columns */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Section 1: Basic Info */}
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b border-slate-50 px-8 py-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Info className="h-5 w-5 text-orange-500" />
                                รายละเอียดบูธ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
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
                                    suffix={<span className="text-xs font-bold text-slate-400 mr-2">บาท</span>}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Location - Professional UX Redesign */}
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b border-slate-50 px-8 py-6 flex flex-row items-center justify-between bg-white">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-500" />
                                ตำแหน่งบูธบนแผนที่
                            </CardTitle>
                            <a 
                                href="https://www.google.com/maps" 
                                target="_blank" 
                                className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 px-3 py-1.5 rounded-xl"
                            >
                                <ExternalLink className="h-3 w-3" />
                                ค้นหาพิกัด
                            </a>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Visual Map Placeholder / Interactive Preview */}
                                <div className="relative w-full md:w-1/3 aspect-video md:aspect-square rounded-3xl bg-slate-100 overflow-hidden group border border-slate-100 shrink-0">
                                    {lat && lng ? (
                                        <>
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="no"
                                                marginHeight={0}
                                                marginWidth={0}
                                                className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng) - 0.005},${parseFloat(lat) - 0.005},${parseFloat(lng) + 0.005},${parseFloat(lat) + 0.005}&layer=mapnik&marker=${lat},${lng}`}
                                            />
                                            {/* We overlay a div to block pointer events to the iframe, so it's purely visual */}
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-200/50 flex flex-col items-center justify-center text-slate-400">
                                            <MapPin className="h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">No Location</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all">
                                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-xl mb-2 text-orange-500 animate-bounce">
                                            <MapPin className="h-6 w-6 fill-current" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-white/80 px-2 py-1 rounded-lg shadow-sm">
                                            Pin Preview
                                        </p>
                                    </div>
                                </div>

                                {/* Input Inputs */}
                                <div className="flex-1 space-y-5">
                                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                                        ระบุพิกัดเพื่อให้ลูกค้าค้นหาบูธผ่านระบบแผนที่ได้แม่นยำขึ้น 
                                        <br /> <span className="text-orange-500 font-medium">* แนะนำให้คัดลอกจาก Google Maps (คลิกขวาที่จุดแล้วเลือกพิกัด)</span>
                                    </p>
                                    
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={handleGetCurrentLocation}
                                                disabled={isLocating}
                                                className="w-full gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 rounded-xl bg-orange-50/30"
                                            >
                                                <Navigation className="h-4 w-4" />
                                                {isLocating ? "กำลังค้นหาพิกัด..." : "ดึงพิกัดปัจจุบันของฉัน (Auto-detect)"}
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
                                            prefix={<MousePointerClick className="h-4 w-4 text-slate-300" />}
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
                                            prefix={<MousePointerClick className="h-4 w-4 text-slate-300" />}
                                        />
                                    </div>
                                    
                                    <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50">
                                        <div className="flex gap-3">
                                            <Info className="h-5 w-5 text-orange-400 shrink-0" />
                                            <p className="text-[11px] text-orange-700/80 leading-normal">
                                                พิกัดนี้จะถูกนำไปใช้ในระบบ <strong>Street View (360 Viewer)</strong> 
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
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b border-slate-50 px-8 py-6 bg-slate-50/50">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                การจัดการ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <Select
                                label="สถานะการใช้งาน"
                                name="is_available"
                                options={statusOptions}
                                defaultValue={initialData?.is_available?.toString() || "true"}
                                required
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

                    {/* Image Upload Placeholder */}
                    <div className="group relative aspect-square rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-orange-300 hover:bg-orange-50/30 flex flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-white p-4 shadow-sm text-slate-400 group-hover:text-orange-500 group-hover:scale-110 transition-all">
                            <Camera className="h-8 w-8" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">รูปภาพบูธ</h4>
                        <p className="mt-1 text-xs text-slate-400">คลิกหรือลากรูปภาพมาวางที่นี่เพื่ออัปโหลด (เร็วๆ นี้)</p>
                    </div>
                </div>
            </div>
        </form>
    );
}