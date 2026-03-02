import { CheckCircle, Clock, XCircle, type LucideIcon } from "lucide-react";
import { BookingStatus, PaymentStatus } from "@/types";

export const statusConfig: Record<
  BookingStatus | string,
  { label: string; color: string; icon: LucideIcon }
> = {
  [BookingStatus.CONFIRMED]: {
    label: "ยืนยันแล้ว",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    icon: CheckCircle,
  },
  [BookingStatus.PENDING]: {
    label: "รอดำเนินการ",
    color: "bg-amber-50 text-amber-700 border-amber-200/50",
    icon: Clock,
  },
  [BookingStatus.COMPLETED]: {
    label: "เสร็จสิ้น",
    color: "bg-blue-50 text-blue-700 border-blue-200/50",
    icon: CheckCircle,
  },
  [BookingStatus.CANCELLED]: {
    label: "ยกเลิก",
    color: "bg-rose-50 text-rose-700 border-rose-200/50",
    icon: XCircle,
  },
};

export const paymentConfig: Record<
  PaymentStatus | string,
  { label: string; color: string }
> = {
  [PaymentStatus.SUCCESS]: {
    label: "ชำระแล้ว",
    color: "bg-emerald-100 text-emerald-700",
  },
  [PaymentStatus.PENDING]: {
    label: "รอชำระ",
    color: "bg-amber-100 text-amber-700",
  },
  [PaymentStatus.CANCEL]: {
    label: "ยกเลิก",
    color: "bg-rose-100 text-rose-700",
  },
};
