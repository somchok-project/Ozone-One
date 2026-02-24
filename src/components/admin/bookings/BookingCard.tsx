"use client";

import { ArrowUpRight } from "lucide-react";
import { formatCurrency, formatThaiDate } from "@/lib/utils/format";
import { getColorStatus } from "@/lib/utils/color";
import { getLabelStatus } from "@/lib/utils/label";

interface BookingCardProps {
  booking: {
    id: string;
    start_date: Date;
    total_price: number;
    payment_status: string;
    booth: {
      name: string;
    };
    user: {
      name: string | null;
      email: string;
    };
  };
}



export default function BookingCard({ booking }: BookingCardProps) {
  return (
    <div className="group flex items-center justify-between py-5 transition-all first:pt-2 last:pb-2">
      <div className="flex items-center gap-4">
        {/* Status Dot */}
        <div
          className={`h-2 w-2 rounded-full ${
            getColorStatus(booking.payment_status).dot
          }`}
        />

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-700">{booking.booth.name}</p>
            <ArrowUpRight className="h-3 w-3 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </div>
          <p className="text-xs font-medium text-slate-400">
            {booking.user.name ?? booking.user.email.split("@")[0]} •{" "}
            {formatThaiDate(booking.start_date)}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-slate-800">
          {formatCurrency(booking.total_price)}
        </p>
        <p
          className={`text-[10px] font-bold uppercase tracking-widest ${
            getColorStatus(booking.payment_status).text
          }`}
        >
          {getLabelStatus(booking.payment_status)}
        </p>
      </div>
    </div>
  );
}
