"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Shield, UserCheck } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { toast } from "sonner";
import { updateUserAction, deleteUserAction } from "../actions";

type Role = "ADMIN" | "CUSTOMER";

interface UserInitialData {
    id: string;
    name: string | null;
    email: string;
    phone_number: string | null;
    role: Role;
    image?: string | null;
    bookingCount?: number;
}

export function UserForm({ initialData }: { initialData: UserInitialData }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDelete] = useTransition();

    const roleOptions = [
        { value: "CUSTOMER", label: "ผู้ใช้งานทั่วไป (Customer)" },
        { value: "ADMIN", label: "ผู้ดูแลระบบ (Admin)" },
    ];

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const id = toast.loading("กำลังบันทึกข้อมูล...");
            const res = await updateUserAction(initialData.id, formData);
            if (res.success) {
                toast.success("บันทึกข้อมูลสำเร็จ", { id });
                router.push("/admin/users");
                router.refresh();
            } else {
                toast.error(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", { id });
            }
        });
    }

    function handleDelete() {
        if (!confirm(`ต้องการลบผู้ใช้ "${initialData.name ?? initialData.email}" ออกจากระบบ?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
        startDelete(async () => {
            const id = toast.loading("กำลังลบผู้ใช้งาน...");
            const res = await deleteUserAction(initialData.id);
            if (res.success) {
                toast.success("ลบผู้ใช้งานสำเร็จ", { id });
                router.push("/admin/users");
                router.refresh();
            } else {
                toast.error(res.error || "เกิดข้อผิดพลาดในการลบผู้ใช้งาน", { id });
            }
        });
    }

    const initials = initialData.name ? initialData.name.slice(0, 2).toUpperCase() : initialData.email.slice(0, 2).toUpperCase();

    return (
        <form action={handleSubmit}>
            {/* Toolbar */}
            <div className="mb-8 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    กลับ
                </button>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-500 shadow-sm transition hover:bg-red-50 disabled:opacity-40"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isDeleting ? "กำลังลบ..." : "ลบผู้ใช้"}
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2 text-sm font-black text-white shadow-md shadow-orange-100 transition hover:bg-orange-600 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left — User Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 flex flex-col items-center text-center gap-4">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-black text-2xl ring-4 ring-orange-50">
                            {initialData.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={initialData.image} alt={initialData.name ?? ""} className="h-full w-full rounded-2xl object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-lg">{initialData.name || "ไม่ระบุชื่อ"}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{initialData.email}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                            initialData.role === "ADMIN"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-sky-50 text-sky-700"
                        }`}>
                            {initialData.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                            {initialData.role === "ADMIN" ? "Admin" : "Customer"}
                        </span>
                        {initialData.bookingCount !== undefined && (
                            <div className="w-full bg-slate-50 rounded-2xl p-4">
                                <p className="text-2xl font-black text-slate-800">{initialData.bookingCount}</p>
                                <p className="text-xs text-slate-400 mt-0.5">การจองทั้งหมด</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                        <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6">ข้อมูลบัญชีผู้ใช้</h2>
                        <div className="space-y-5">
                            <div className="grid gap-5 md:grid-cols-2">
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
                            <div className="grid gap-5 md:grid-cols-2">
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

                        {/* Warning */}
                        {initialData.role !== "ADMIN" && (
                            <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700 font-medium">
                                ⚠️ การเปลี่ยนสิทธิ์เป็น Admin จะให้สิทธิ์เข้าถึงระบบหลังบ้านทั้งหมด
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
