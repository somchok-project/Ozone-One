import { api } from "@/trpc/server";
import BoothDetail, {
  type BoothDetailProps,
} from "@/components/customer/BoothDetail";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Box } from "lucide-react"; // เผื่อเอาไว้ตกแต่งหัวข้อ

// 1. Import ตัว 3D Viewer มาจากฝั่ง Admin (หรือถ้าคุณย้ายไฟล์ไปไว้โฟลเดอร์กลาง ก็ปรับ path ตามนั้นนะครับ)
import BoothViewer3D from "@/app/admin/booths/_components/BoothViewer3D";

interface BoothPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoothPage({ params }: BoothPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // ดึงข้อมูลบูธจาก tRPC
  const booth = await api.booth.getById({ id });

  const serializedBooth = JSON.parse(
    JSON.stringify(booth),
  ) as BoothDetailProps["booth"];

  // 2. แปลงข้อมูล booth_items ให้พร้อมสำหรับ 3D Viewer
  // (เช็ค ? เผื่อกรณีที่ backend ยังไม่ได้ส่ง booth_items มา)
  const viewerItems = booth?.booth_items?.map((item: any) => ({
    id: item.id,
    type: item.item_type,
    position: [item.position_x, item.position_y, item.position_z] as [number, number, number],
    rotation: [item.rotation_x, item.rotation_y, item.rotation_z] as [number, number, number],
    color: item.color,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* รายละเอียดบูธเดิมของคุณ */}
        <BoothDetail booth={serializedBooth} />

        {/* 3. ส่วนแสดงผล 3D Viewer วางต่อท้ายตรงนี้ */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Box className="h-6 w-6 text-orange-500" />
              การจัดวางพื้นที่บูธ (3D Layout)
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              ขนาด {booth?.dimension ?? "ไม่ระบุ"}
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-100">
            {viewerItems.length > 0 ? (
              // แสดง 3D ถ้ามีข้อมูล
              <BoothViewer3D items={viewerItems} dimension={booth?.dimension ?? "3x3"} />
            ) : (
              // แสดงกล่องข้อความถ้ายังไม่มีการจัด Layout
              <div className="flex h-[350px] flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white text-center">
                <Box className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-500">ยังไม่มีข้อมูล 3D Layout สำหรับบูธนี้</p>
                <p className="mt-1 text-sm text-slate-400">รูปจำลองพื้นที่กำลังอยู่ในระหว่างการจัดทำ</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}