"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle, Flag, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  confirmBookingAction,
  completeBookingAction,
  cancelBookingAction,
} from "../actions";

interface BookingActionsProps {
  bookingId: string;
  bookingStatus: string;
}

export function BookingActions({
  bookingId,
  bookingStatus,
}: BookingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function run(
    action: (id: string) => Promise<{ success: boolean; error?: string }>,
    label: string,
  ) {
    setOpen(false);
    startTransition(async () => {
      const id = toast.loading(`กำลัง${label}...`);
      const res = await action(bookingId);
      if (res.success) toast.success(`${label}สำเร็จ`, { id });
      else toast.error(res.error ?? "เกิดข้อผิดพลาด", { id });
    });
  }

  const canConfirm = bookingStatus === "PENDING";
  const canComplete = bookingStatus === "CONFIRMED";
  const canCancel = bookingStatus === "PENDING" || bookingStatus === "CONFIRMED";
  const isDone =
    bookingStatus === "COMPLETED" || bookingStatus === "CANCELLED";

  if (isDone) {
    return (
      <span className="text-xs text-slate-300 italic">
        {bookingStatus === "COMPLETED" ? "เสร็จสิ้น" : "ยกเลิกแล้ว"}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <>
            จัดการ <ChevronDown size={12} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
          {canConfirm && (
            <button
              onClick={() => run(confirmBookingAction, "ยืนยันการจอง")}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-bold text-green-600 hover:bg-green-50"
            >
              <CheckCircle size={14} />
              ยืนยันการจอง
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => run(completeBookingAction, "เสร็จสิ้นการจอง")}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-bold text-blue-600 hover:bg-blue-50"
            >
              <Flag size={14} />
              ทำเครื่องหมายว่าเสร็จ
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => run(cancelBookingAction, "ยกเลิกการจอง")}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50"
            >
              <XCircle size={14} />
              ยกเลิกการจอง
            </button>
          )}
        </div>
      )}
    </div>
  );
}
