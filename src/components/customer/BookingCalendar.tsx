"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingCalendarProps {
  bookings: { start_date: string; end_date: string }[];
  selectedStart: string;
  selectedEnd: string;
  onSelectRange: (start: string, end: string) => void;
}

export default function BookingCalendar({
  bookings,
  selectedStart,
  selectedEnd,
  onSelectRange,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper to normalize date to YYYY-MM-DD (local timezone)
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Minimum selectable date = tomorrow (must book at least 1 day in advance)
  const minBookingDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);

  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((b) => {
      const current = new Date(b.start_date);
      const end = new Date(b.end_date);
      while (current <= end) {
        dates.add(formatDateKey(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return dates;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateKey(date);
    if (bookedDates.has(dateStr)) return;
    if (date < minBookingDate) return;

    // No selection yet, or a range is already selected → start new single-day selection
    if (!selectedStart || (selectedStart && selectedEnd && selectedStart !== selectedEnd)) {
      onSelectRange(dateStr, dateStr);
    } else {
      // Single-day is selected (start === end) → extend to range
      if (dateStr === selectedStart) return; // clicked same date, ignore

      const start = new Date(selectedStart);
      const end = new Date(dateStr);
      const [realStart, realEnd] = start < end ? [start, end] : [end, start];

      // Check for booked dates within the range
      let hasOverlap = false;
      const temp = new Date(realStart);
      while (temp <= realEnd) {
        if (bookedDates.has(formatDateKey(temp))) {
          hasOverlap = true;
          break;
        }
        temp.setDate(temp.getDate() + 1);
      }

      if (hasOverlap) {
        onSelectRange(dateStr, dateStr);
      } else {
        onSelectRange(formatDateKey(realStart), formatDateKey(realEnd));
      }
    }
  };

  const isSelected = (dateStr: string) => {
    return dateStr === selectedStart || dateStr === selectedEnd;
  };

  const isInRange = (dateStr: string) => {
    if (!selectedStart || !selectedEnd) return false;
    return dateStr > selectedStart && dateStr < selectedEnd;
  };

  const monthName = currentMonth.toLocaleString("th-TH", {
    month: "long",
    year: "numeric",
  });

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm select-none">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{monthName}</h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
          <div
            key={day}
            className="pb-2 text-center text-[10px] font-bold tracking-wider text-gray-400 uppercase"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;

          const dateStr = formatDateKey(date);
          const booked = bookedDates.has(dateStr);
          const isPast = date < minBookingDate;
          const disabled = booked || isPast;
          const selected = isSelected(dateStr);
          const range = isInRange(dateStr);
          const isToday = formatDateKey(new Date()) === dateStr;

          return (
            <button
              key={dateStr}
              disabled={disabled}
              onClick={() => handleDateClick(date)}
              className={`relative flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium transition-all ${booked ? "cursor-not-allowed bg-red-50 text-red-300 line-through" : isPast ? "cursor-not-allowed text-gray-300" : "hover:bg-orange-50 hover:text-orange-600"} ${selected ? "z-10 scale-105 bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:text-white" : ""} ${range ? "rounded-none bg-orange-100 text-orange-700 first:rounded-l-xl last:rounded-r-xl" : ""} ${isToday && !selected ? "ring-1 ring-orange-200" : ""} `}
            >
              {date.getDate()}
              {isToday && !selected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-gray-200" />
          <span className="text-[11px] font-medium text-gray-500">ผ่านแล้ว</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-200" />
          <span className="text-[11px] font-medium text-gray-500">จองแล้ว</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="text-[11px] font-medium text-gray-500">
            เลือกอยู่
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-orange-100" />
          <span className="text-[11px] font-medium text-gray-500">
            ช่วงเวลา
          </span>
        </div>
      </div>
    </div>
  );
}
