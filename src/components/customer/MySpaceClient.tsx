"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Trash2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";
import WriteReviewModal from "./WriteReviewModal";
import { type Booking, BookingStatus, PaymentStatus } from "@/types";
import { statusConfig, paymentConfig } from "@/constants/booking";
import { formatThaiDate } from "@/lib/utils/format";

interface MySpaceClientProps {
  bookings: Booking[];
}

function BookingCountdown({
  createdAt,
  onExpire,
}: {
  createdAt: string | Date;
  onExpire: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const expireTime = new Date(createdAt).getTime() + 10 * 60 * 1000;
    
    function update() {
      const now = Date.now();
      const diff = Math.floor((expireTime - now) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        onExpire();
      } else {
        setTimeLeft(diff);
      }
    }
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt, onExpire]);

  if (timeLeft <= 0) return null;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${timeLeft <= 120 ? "animate-pulse bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {formatted}
    </div>
  );
}

export default function MySpaceClient({ bookings }: MySpaceClientProps) {
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const router = useRouter();

  const cancelBooking = api.booking.cancelBooking.useMutation({
    onSuccess: () => {
      toast.success("ยกเลิกการจองเรียบร้อยแล้ว");
      setCancellingId(null);
      setConfirmCancelId(null);
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.message ?? "ไม่สามารถยกเลิกการจองได้");
      setCancellingId(null);
      setConfirmCancelId(null);
    },
  });

  function handleCancel(bookingId: string) {
    setCancellingId(bookingId);
    cancelBooking.mutate({ booking_id: bookingId });
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-4xl bg-orange-500 text-white shadow-lg shadow-orange-200 transition-transform hover:rotate-3">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              พื้นที่ของฉัน
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              จัดการรายการจองพื้นที่ Ozone One Market ทั้งหมดของคุณ
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border border-slate-100 bg-white p-20 text-center shadow-sm">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping rounded-full bg-orange-100 opacity-20" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
                <ShoppingBag size={48} className="text-orange-500" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-black text-slate-900">
              ยังไม่มีการจอง
            </h2>
            <p className="mb-10 max-w-xs text-slate-500">
              ดูพื้นที่ว่างในตลาดแล้วเริ่มจองพื้นที่ขายของคุณได้เลยวันนี้
            </p>
            <Link
              href="/customer#booths"
              className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:scale-[1.02] hover:bg-orange-600 active:scale-[0.98]"
            >
              ดูพื้นที่ว่างที่น่าสนใจ
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const status =
                statusConfig[booking.booking_status] ??
                statusConfig[BookingStatus.PENDING]!;
              const payment =
                paymentConfig[booking.payment_status] ??
                paymentConfig[PaymentStatus.PENDING]!;
              const StatusIcon = status.icon;
              const boothImage =
                booking.booth.images?.[0]?.path ?? "/placeholder-image.jpg";

              const startDate = formatThaiDate(new Date(booking.start_date));
              const endDate = formatThaiDate(new Date(booking.end_date));

              const isPending =
                booking.booking_status === BookingStatus.PENDING;
              const canReview =
                booking.booking_status === BookingStatus.COMPLETED ||
                booking.booking_status === BookingStatus.CONFIRMED;
              const needsPayment =
                booking.payment_status === PaymentStatus.PENDING;
              const isCancelling = cancellingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white/70 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-xl transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-slate-200/50"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Booth Image */}
                    <div className="relative h-64 w-full shrink-0 overflow-hidden lg:h-auto lg:w-64">
                      <Image
                        src={boothImage}
                        alt={booking.booth.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent lg:hidden" />
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col justify-between p-8">
                      <div>
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black tracking-wider uppercase ${status.color}`}
                            >
                              <StatusIcon size={12} />
                              {status.label}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black tracking-wider uppercase ${payment.color}`}
                            >
                              {payment.label}
                            </span>
                            {isPending && needsPayment && (
                              <BookingCountdown 
                                createdAt={booking.created_at} 
                                onExpire={() => router.refresh()} 
                              />
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-400">
                            Booking ID: {booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <h3 className="mb-4 text-2xl font-black tracking-tight text-slate-900">
                          {booking.booth.name}
                        </h3>

                        <div className="grid gap-4 sm:flex sm:items-center sm:gap-8">
                          <div className="flex items-center gap-3 rounded-2xl bg-amber-50/50 px-4 py-2 ring-1 ring-amber-100/50">
                            <Calendar size={16} className="text-amber-600" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-amber-600/60 uppercase">
                                เช่าช่วงวันที่
                              </span>
                              <span className="text-sm font-bold text-amber-900">
                                {startDate} — {endDate}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-blue-50/50 px-4 py-2 ring-1 ring-blue-100/50">
                            <MapPin size={16} className="text-blue-600" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-blue-600/60 uppercase">
                                สถานที่
                              </span>
                              <span className="text-sm font-bold text-blue-900">
                                Ozone One Market
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-8 sm:flex-row">
                        <div>
                          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                            ยอดชำระสุทธิ
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black tracking-tighter text-slate-900">
                              ฿{booking.total_price.toLocaleString()}
                            </span>
                            <span className="text-sm font-bold text-slate-400">
                              บาท
                            </span>
                          </div>
                        </div>

                        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                          {booking.payment_slip_url && (
                            <a
                              href={booking.payment_slip_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-all hover:border-orange-200 hover:text-orange-600"
                            >
                              ดูหลักฐานการโอน
                            </a>
                          )}

                          {isPending && needsPayment && (
                            <button
                              onClick={() => setPaymentBooking(booking)}
                              className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 active:scale-95"
                            >
                              <CreditCard size={18} />
                              ชำระเงินตอนนี้
                            </button>
                          )}

                          {canReview && (
                            <button
                              onClick={() => setReviewBooking(booking)}
                              className="flex h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-6 text-sm font-bold text-orange-700 transition-all hover:bg-orange-100 active:scale-95"
                            >
                              <MessageSquare size={18} />
                              เขียนรีวิว
                            </button>
                          )}

                          {isPending &&
                            (confirmCancelId === booking.id ? (
                              <div className="animate-in fade-in zoom-in flex items-center gap-2 duration-300">
                                <button
                                  onClick={() => handleCancel(booking.id)}
                                  disabled={isCancelling}
                                  className="flex h-11 items-center rounded-xl bg-rose-600 px-5 text-sm font-bold text-white transition-all hover:bg-rose-700 disabled:opacity-50"
                                >
                                  {isCancelling
                                    ? "กำลังยกเลิก..."
                                    : "ยืนยันยกเลิก"}
                                </button>
                                <button
                                  onClick={() => setConfirmCancelId(null)}
                                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50"
                                >
                                  <XCircle size={20} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmCancelId(booking.id)}
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                                title="ยกเลิกการจอง"
                              >
                                <Trash2 size={18} />
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSuccess={() => setPaymentBooking(null)}
        />
      )}

      {reviewBooking && (
        <WriteReviewModal
          boothId={reviewBooking.booth.id}
          boothName={reviewBooking.booth.name}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
}
