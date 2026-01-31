import Link from "next/link";
import { Plus, Search, MoreVertical, Store } from "lucide-react";
import { Card, CardContent, Button, Input } from "@/components/ui";

interface Booth {
  id: string;
  name: string;
  type: string;
  weekdayPrice: number;
  weekendPrice: number;
  status: "available" | "occupied" | "maintenance";
}

const mockBooths: Booth[] = [
  {
    id: "1",
    name: "Zone A-01",
    type: "มาตรฐาน",
    weekdayPrice: 300,
    weekendPrice: 450,
    status: "available",
  },
  {
    id: "2",
    name: "Zone A-02",
    type: "พรีเมียม",
    weekdayPrice: 500,
    weekendPrice: 750,
    status: "occupied",
  },
  {
    id: "3",
    name: "Zone B-01",
    type: "VIP",
    weekdayPrice: 800,
    weekendPrice: 1200,
    status: "available",
  },
  {
    id: "4",
    name: "Zone B-02",
    type: "มาตรฐาน",
    weekdayPrice: 300,
    weekendPrice: 450,
    status: "maintenance",
  },
];

const statusConfig = {
  available: { label: "ว่าง", color: "bg-green-50 text-green-700" },
  occupied: { label: "ถูกจอง", color: "bg-blue-50 text-blue-700" },
  maintenance: { label: "ปิดปรับปรุง", color: "bg-gray-50 text-gray-700" },
};

export default function BoothsPage() {
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
          <Link href="/booths/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มบูธใหม่
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาบูธ..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="md">
                  ทั้งหมด
                </Button>
                <Button variant="ghost" size="md">
                  ว่าง
                </Button>
                <Button variant="ghost" size="md">
                  ถูกจอง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booth Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockBooths.map((booth) => (
            <Card
              key={booth.id}
              className="group cursor-pointer transition-all hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Store className="h-6 w-6 text-orange-600" />
                    </div>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 opacity-0 transition-opacity hover:bg-white hover:text-gray-600 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <span
                    className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[booth.status].color}`}
                  >
                    {statusConfig[booth.status].label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{booth.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{booth.type}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-xs text-gray-500">วันปกติ</p>
                      <p className="font-medium text-gray-900">
                        ฿{booth.weekdayPrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">วันหยุด</p>
                      <p className="font-medium text-gray-900">
                        ฿{booth.weekendPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
