"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, User, CalendarDays } from "lucide-react";
import { formatThaiDate, formatCurrency } from "@/lib/utils/format";
import { getBookingStatusLabel } from "@/lib/utils/bookingStatus";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  booking_status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  payment_status: "PENDING" | "SUCCESS" | "CANCEL";
  total_price: number;
  user: { name: string | null; email: string };
}

interface BookingCalendarProps {
  bookings: Booking[];
}

const STATUS_CONFIG = {
  CONFIRMED: {
    bg: "bg-green-500",
    light: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
  },
  PENDING: {
    bg: "bg-amber-400",
    light: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-400",
  },
  COMPLETED: {
    bg: "bg-blue-400",
    light: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-400",
  },
  CANCELLED: {
    bg: "bg-slate-300",
    light: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-300",
  },
};

const DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTH_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Build a map: dateStr -> booking (only non-cancelled)
  const dateMap = new Map<string, Booking>();
  const activeBookings = bookings.filter((b) => b.booking_status !== "CANCELLED");
  for (const booking of activeBookings) {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const cur = new Date(start);
    while (cur <= end) {
      dateMap.set(toDateStr(cur), booking);
      cur.setDate(cur.getDate() + 1);
    }
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Bookings for this month's list
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthBookings = bookings.filter((b) => {
    const s = new Date(b.start_date);
    const e = new Date(b.end_date);
    return s <= monthEnd && e >= monthStart;
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ── Calendar ── */}
      <div className="lg:col-span-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold text-slate-900">
            {MONTH_NAMES[month]} {year + 543}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const booking = dateMap.get(dateStr);
            const isToday = toDateStr(today) === dateStr;
            const isSelected = booking?.id === selectedBookingId;
            const cfg = booking ? STATUS_CONFIG[booking.booking_status] : null;

            return (
              <button
                key={dateStr}
                onClick={() => {
                  if (booking) setSelectedBookingId(booking.id === selectedBookingId ? null : booking.id);
                }}
                className={`
                  relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${booking ? `${cfg!.bg} text-white cursor-pointer hover:opacity-80 hover:scale-105` : "text-slate-700 hover:bg-slate-50"}
                  ${isToday && !booking ? "ring-2 ring-orange-400 ring-offset-1 font-bold text-orange-600" : ""}
                  ${isSelected ? "ring-2 ring-slate-900 ring-offset-1 scale-110" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-50 pt-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
              {getBookingStatusLabel(key)}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full ring-2 ring-orange-400 ring-offset-1" />
            วันนี้
          </div>
        </div>
      </div>

      {/* ── Bookings list for this month ── */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          การจองเดือนนี้
          {monthBookings.length > 0 && (
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {monthBookings.length}
            </span>
          )}
        </div>

        {monthBookings.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10 text-center">
            <CalendarDays className="mb-2 h-8 w-8 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">ไม่มีการจองเดือนนี้</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: 380 }}>
            {monthBookings.map((b) => {
              const cfg = STATUS_CONFIG[b.booking_status];
              const isSelected = b.id === selectedBookingId;
              const days = Math.ceil(
                (new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id === selectedBookingId ? null : b.id)}
                  className={`w-full rounded-2xl border p-3.5 text-left transition-all hover:shadow-sm ${
                    isSelected
                      ? "border-slate-900 bg-slate-50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-xl ${cfg.light} px-2.5 py-1 text-[11px] font-bold ${cfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {getBookingStatusLabel(b.booking_status)}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(b.total_price)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate font-medium">{b.user.name ?? b.user.email}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {formatThaiDate(new Date(b.start_date))} — {formatThaiDate(new Date(b.end_date))}
                    <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
                      {days} วัน
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
