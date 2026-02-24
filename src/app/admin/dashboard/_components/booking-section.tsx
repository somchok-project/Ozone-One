"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import BookingCard from "@/components/admin/bookings/BookingCard";

interface BookingSectionProps {
  recentBookings: any[];
}

export default function BookingSection({ recentBookings }: BookingSectionProps) {
  return (
    <Card className="border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <CalendarDays className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-bold text-slate-800">การจองล่าสุด</CardTitle>
        </div>
        <Link 
          href="/admin/bookings" 
          className="text-xs font-semibold text-slate-400 transition-colors hover:text-orange-600"
        >
          ดูทั้งหมด
        </Link>
      </CardHeader>
      
      <CardContent>
        <div className="divide-y divide-slate-50">
          {recentBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}

          {recentBookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-slate-50 p-3">
                <CalendarDays className="h-6 w-6 text-slate-200" />
              </div>
              <p className="text-sm font-medium text-slate-400">ยังไม่มีรายการจองในขณะนี้</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}