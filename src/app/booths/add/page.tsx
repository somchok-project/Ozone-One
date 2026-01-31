"use client";

import Link from "next/link";
import { ChevronRight, Save } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
} from "@/components/ui";

export default function AddBoothPage() {
  const boothTypeOptions = [
    { value: "standard", label: "มาตรฐาน ( Standard )" },
    { value: "premium", label: "พรีเมียม ( Premium )" },
    { value: "vip", label: "VIP" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/booths" className="hover:text-orange-600">
            จัดการบูธ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">เพิ่มบูธใหม่</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">เพิ่มบูธใหม่</h1>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            เพิ่มบูธใหม่
          </Button>
        </div>

        {/* Basic Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐานบูธ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Input
                label="ชื่อบูธ / รหัสตำแหน่ง"
                placeholder="ตัวอย่าง เช่น Zone A-01"
                id="boothName"
              />
              <div className="grid gap-6 md:grid-cols-2">
                <Select
                  label="ประเภทบูธ"
                  options={boothTypeOptions}
                  defaultValue="standard"
                  id="boothType"
                />
                <Input
                  label="ประเภทบูธ"
                  placeholder="ตัวอย่าง เช่น Zone A-01"
                  id="boothZone"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle>กำหนดราคาเช่า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Weekday Pricing */}
              <div className="rounded-xl border border-gray-200 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">วันปกติ</h4>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                    จ - ศ
                  </span>
                </div>
                <Input
                  label="ราคา"
                  placeholder="0.00"
                  prefix="฿"
                  type="number"
                  id="weekdayPrice"
                />
              </div>

              {/* Weekend Pricing */}
              <div className="rounded-xl border border-gray-200 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">วันหยุด</h4>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                    ส - อา
                  </span>
                </div>
                <Input
                  label="ราคา"
                  placeholder="0.00"
                  prefix="฿"
                  type="number"
                  id="weekendPrice"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
