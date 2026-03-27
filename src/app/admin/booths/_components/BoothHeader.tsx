import Link from "next/link";
import { Plus, Store, MapPinned } from "lucide-react";
import { Button } from "@/components/ui";

export function BoothHeader() {
    return (
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px]">
                    <Store className="h-4 w-4" />
                    Inventory Management
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">จัดการบูธทั้งหมด</h1>
                <p className="text-slate-500 text-sm">เพิ่ม ลบ หรือแก้ไขข้อมูลบูธในตลาดของคุณ</p>
            </div>

            <div className="flex items-center gap-3">
                <Link href="/admin/booths/layout-3d">
                    <Button className="h-12 px-6 rounded-2xl bg-orange-300 hover:bg-orange-700 shadow-lg shadow-orange-200 gap-2 transition-all active:scale-95 cursor-pointer">
                        <MapPinned className="h-5 w-5 text-white-500" />
                        จัดผัง 3D
                    </Button>
                </Link>
                <Link href="/admin/booths/add">
                    <Button className="h-12 px-6 rounded-2xl bg-orange-300 hover:bg-orange-700 shadow-lg shadow-orange-200 gap-2 transition-all active:scale-95 cursor-pointer">
                        <Plus className="h-5 w-5" />
                        เพิ่มบูธใหม่
                    </Button>
                </Link>
            </div>
        </div>
    );
}
