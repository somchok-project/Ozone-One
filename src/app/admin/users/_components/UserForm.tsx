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
import { updateUserAction } from "../actions";

type Role = "ADMIN" | "USER";

interface UserInitialData {
    id: string;
    name: string | null;
    email: string;
    phone_number: string | null;
    role: Role;
}

export function UserForm({
    initialData
}: {
    initialData: UserInitialData
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const roleOptions = [
        { value: "USER", label: "ผู้ใช้งานทั่วไป" },
        { value: "ADMIN", label: "ผู้ดูแลระบบ" },
    ];

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const res = await updateUserAction(initialData.id, formData);

            if (res.success) {
                router.push("/admin/users");
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
                <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้งาน</h1>
                <Button type="submit" disabled={isPending} className="gap-2 cursor-pointer">
                    <Save className="h-4 w-4" />
                    {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Basic Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลผู้ใช้</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Input
                                    label="ชื่อ - นามสกุล"
                                    name="name"
                                    placeholder="ระบุชื่อผู้ใช้งาน"
                                    required
                                    defaultValue={initialData.name || ""}
                                />
                                <Input
                                    label="อีเมล"
                                    name="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    required
                                    defaultValue={initialData.email}
                                />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Input
                                    label="เบอร์โทรศัพท์"
                                    name="phone_number"
                                    type="tel"
                                    placeholder="08X-XXX-XXXX"
                                    defaultValue={initialData.phone_number || ""}
                                />
                                <Select
                                    label="สิทธิ์การใช้งาน (Role)"
                                    name="role"
                                    options={roleOptions}
                                    defaultValue={initialData.role}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
