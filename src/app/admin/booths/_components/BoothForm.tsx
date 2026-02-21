"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
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

type BoothType = "FREE" | "BOOKING";

interface UserOption {
    value: string;
    label: string;
}

interface BoothInitialData {
    id: string;
    name: string;
    type: BoothType;
    price: number;
    is_available: string;
    user_id: string;
    latitude: number;
    longitude: number;
    dimension: string;
}

export function BoothForm({
    users,
    initialData
}: {
    users: UserOption[],
    initialData?: BoothInitialData
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const isEditing = !!initialData;

    const boothTypeOptions = [
        { value: "FREE", label: "ฟรี" },
        { value: "BOOKING", label: "จองล่วงหน้า" },
    ];

    const statusOptions = [
        { value: "true", label: "เปิดใช้งาน / ว่าง" },
        { value: "false", label: "ปิดใช้งาน / ไม่ว่าง" },
    ];

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            let res;
            if (isEditing && initialData) {
                res = await updateBoothAction(initialData.id, formData);
            } else {
                res = await createBoothAction(formData);
            }

            if (res.success) {
                router.push("/admin/booths");
                router.refresh();
            } else {
                alert(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        });
    }

    return (
        <form action={handleSubmit}>
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? "แก้ไขข้อมูลบูธ" : "เพิ่มบูธใหม่"}
                </h1>
                <Button type="submit" disabled={isPending} className="gap-2 cursor-pointer">
                    <Save className="h-4 w-4" />
                    {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Basic Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลพื้นฐานบูธ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Input
                                    label="ชื่อบูธ"
                                    name="name"
                                    placeholder="ตัวอย่าง เช่น Zone A-01"
                                    required
                                    defaultValue={initialData?.name}
                                />
                                <Input
                                    label="ขนาดพื้นที่"
                                    name="dimension"
                                    placeholder="เช่น 3x3 เมตร"
                                    required
                                    defaultValue={initialData?.dimension}
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Select
                                    label="ประเภทบูธ"
                                    name="type"
                                    options={boothTypeOptions}
                                    defaultValue={initialData?.type || "FREE"}
                                    required
                                />
                                <Input
                                    label="ราคา"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    prefix="฿"
                                    required
                                    defaultValue={initialData?.price}
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Select
                                    label="สถานะ"
                                    name="is_available"
                                    options={statusOptions}
                                    defaultValue={initialData?.is_available || "true"}
                                    required
                                />
                                <Select
                                    label="เจ้าของบูธ (User ID)"
                                    name="user_id"
                                    options={users}
                                    required
                                    defaultValue={initialData?.user_id}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>พิกัดตำแหน่ง (Latitude / Longitude)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Input
                                label="ละติจูด (Latitude)"
                                name="latitude"
                                type="number"
                                step="any"
                                placeholder="13.7563"
                                required
                                defaultValue={initialData?.latitude}
                            />
                            <Input
                                label="ลองจิจูด (Longitude)"
                                name="longitude"
                                type="number"
                                step="any"
                                placeholder="100.5018"
                                required
                                defaultValue={initialData?.longitude}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
