"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatThaiDate } from "@/lib/utils/format";

interface BookingSectionProps {
  recentBookings: any[];
}

export default function BookingSection({ recentBookings }: BookingSectionProps) {
  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">การจองล่าสุด</CardTitle>
        <Link href="/admin/bookings" className="text-xs font-medium text-orange-600 hover:underline">
          ดูทั้งหมด
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-900">{booking.booth.name}</p>
                <p className="text-xs text-slate-500">
                  {booking.user.name ?? booking.user.email} • {formatThaiDate(booking.start_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{formatCurrency(booking.total_price)}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  booking.payment_status === "SUCCESS" ? "text-emerald-600" : 
                  booking.payment_status === "PENDING" ? "text-amber-600" : "text-rose-600"
                }`}>
                  {booking.payment_status === "SUCCESS" ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          ))}
          {recentBookings.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">ยังไม่มีข้อมูลการจอง</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
