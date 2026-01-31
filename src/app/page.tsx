import Link from "next/link";
import {
  Store,
  CalendarCheck,
  BarChart3,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
  color,
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card className="group h-full cursor-pointer transition-all hover:shadow-md">
        <CardContent className="flex items-start gap-4 p-6">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-orange-600" />
        </CardContent>
      </Card>
    </Link>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${changeColors[changeType]}`}
            >
              {changeType === "positive" && <TrendingUp className="h-3 w-3" />}
              {change}
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-12 text-white sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                ยินดีต้อนรับสู่ SpotRent
              </h1>
              <p className="mt-2 text-orange-100">
                ระบบจัดการเช่าบูธอัจฉริยะ สะดวก รวดเร็ว ปลอดภัย
              </p>
            </div>
            <Link href="/booths/add">
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 bg-white text-orange-600 hover:bg-orange-50"
              >
                <Plus className="h-5 w-5" />
                เพิ่มบูธใหม่
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        {/* Stats Section */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="บูธทั้งหมด"
            value="24"
            change="+3 จากเดือนที่แล้ว"
            changeType="positive"
            icon={<Store className="h-6 w-6" />}
          />
          <StatCard
            title="การจองวันนี้"
            value="12"
            change="+5 จากเมื่อวาน"
            changeType="positive"
            icon={<CalendarCheck className="h-6 w-6" />}
          />
          <StatCard
            title="ลูกค้าใหม่"
            value="8"
            change="เดือนนี้"
            changeType="neutral"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="รายได้เดือนนี้"
            value="฿45,200"
            change="+12% จากเดือนที่แล้ว"
            changeType="positive"
            icon={<DollarSign className="h-6 w-6" />}
          />
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>เมนูด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <QuickActionCard
                title="จัดการบูธ"
                description="เพิ่ม แก้ไข หรือลบข้อมูลบูธ"
                icon={<Store className="h-6 w-6 text-orange-600" />}
                href="/booths"
                color="bg-orange-50"
              />
              <QuickActionCard
                title="รายการจอง"
                description="ดูและจัดการการจองบูธ"
                icon={<CalendarCheck className="h-6 w-6 text-blue-600" />}
                href="/bookings"
                color="bg-blue-50"
              />
              <QuickActionCard
                title="รายงาน"
                description="ดูสถิติและรายงานต่างๆ"
                icon={<BarChart3 className="h-6 w-6 text-green-600" />}
                href="/reports"
                color="bg-green-50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>การจองล่าสุด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    booth: "Zone A-01",
                    customer: "คุณสมชาย",
                    date: "31 ม.ค. 2569",
                    status: "confirmed",
                  },
                  {
                    booth: "Zone B-03",
                    customer: "คุณสมหญิง",
                    date: "30 ม.ค. 2569",
                    status: "pending",
                  },
                  {
                    booth: "Zone A-05",
                    customer: "คุณวิชัย",
                    date: "29 ม.ค. 2569",
                    status: "confirmed",
                  },
                ].map((booking, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.booth}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.customer} • {booking.date}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {booking.status === "confirmed" ? "ยืนยันแล้ว" : "รอยืนยัน"}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/bookings"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>บูธยอดนิยม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Zone A-01", bookings: 45, revenue: "฿13,500" },
                  { name: "Zone B-02", bookings: 38, revenue: "฿11,400" },
                  { name: "Zone A-03", bookings: 32, revenue: "฿9,600" },
                ].map((booth, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{booth.name}</p>
                        <p className="text-sm text-gray-500">
                          {booth.bookings} การจอง
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {booth.revenue}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/reports"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                ดูรายงานทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
