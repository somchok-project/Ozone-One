import Link from "next/link";
import { Plus, Edit, Store } from "lucide-react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { db } from "@/server/db";
import { DeleteBoothButton } from "./_components/DeleteBoothButton";
import { SearchInput } from "@/components/admin/SearchInput";

const statusConfig = {
  available: { label: "ว่าง", color: "bg-green-50 text-green-700" },
  occupied: { label: "ถูกจอง", color: "bg-blue-50 text-blue-700" },
  maintenance: { label: "ปิดปรับปรุง", color: "bg-gray-50 text-gray-700" },
};

export default async function BoothsPage(props: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const statusFilter = searchParams?.status || "all";

  const booths = await db.booth.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
      ...(statusFilter !== "all"
        ? { is_available: statusFilter === "available" }
        : {}),
    },
    orderBy: {
      name: 'asc'
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการบูธ</h1>
            <p className="mt-1 text-sm text-gray-500">
              จัดการข้อมูลบูธทั้งหมดในระบบ
            </p>
          </div>
          <Link href="/admin/booths/add">
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4 c" />
              เพิ่มบูธใหม่
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SearchInput placeholder="ค้นหาบูธ..." />
              <div className="flex gap-2">
                <Link href={`/admin/booths?${new URLSearchParams({ ...(query ? { q: query } : {}), status: 'all' }).toString()}`}>
                  <Button variant={statusFilter === 'all' ? 'primary' : 'outline'} size="sm" className="cursor-pointer">
                    ทั้งหมด
                  </Button>
                </Link>
                <Link href={`/admin/booths?${new URLSearchParams({ ...(query ? { q: query } : {}), status: 'available' }).toString()}`}>
                  <Button variant={statusFilter === 'available' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer">
                    ว่าง
                  </Button>
                </Link>
                <Link href={`/admin/booths?${new URLSearchParams({ ...(query ? { q: query } : {}), status: 'occupied' }).toString()}`}>
                  <Button variant={statusFilter === 'occupied' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer">
                    ถูกจอง
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booth Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">ชื่อบูธ</th>
                  {/* <th className="px-6 py-4 font-semibold">ประเภท</th> */}
                  <th className="px-6 py-4 font-semibold">ขนาด</th>
                  <th className="px-6 py-4 font-semibold">ราคา</th>
                  <th className="px-6 py-4 font-semibold">สถานะ</th>
                  <th className="px-6 py-4 text-right font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {booths.map((booth) => {
                  const status = booth.is_available ? "available" : "occupied";
                  const statusInfo = statusConfig[status];

                  return (
                    <tr key={booth.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                            <Store className="h-5 w-5 text-orange-600" />
                          </div>
                          <span className="font-semibold text-gray-900">{booth.name}</span>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        {booth.type === "BOOKING" ? "จองแล้ว" : "ว่าง"}
                      </td> */}
                      <td className="px-6 py-4">
                        {booth.dimension || "-"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ฿{booth.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/booths/${booth.id}/edit`}>
                            <Button variant="outline" size="sm" className="h-10 w-10 px-0 cursor-pointer" title="แก้ไข">
                              <Edit className="h-5 w-5" />
                            </Button>
                          </Link>
                          <DeleteBoothButton boothId={booth.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
