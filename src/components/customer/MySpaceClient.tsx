"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar,
    MapPin,
    CheckCircle,
    Clock,
    XCircle,
    ArrowRight,
    ShoppingBag,
    CreditCard,
    Trash2,
    MessageSquare,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PaymentModal from "./PaymentModal";
import WriteReviewModal from "./WriteReviewModal";

interface Booking {
    id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    payment_status: string;
    booking_status: string;
    payment_slip_url: string | null;
    booth: {
        id: string;
        name: string;
        price: number;
        images: { id: string; path: string; booth_id: string }[];
    };
}

interface MySpaceClientProps {
    bookings: Booking[];
}

const statusConfig: Record<
    string,
    { label: string; color: string; icon: typeof CheckCircle }
> = {
    CONFIRMED: {
        label: "ยืนยันแล้ว",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
    },
    PENDING: {
        label: "รอดำเนินการ",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
    },
    COMPLETED: {
        label: "เสร็จสิ้น",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle,
    },
    CANCELLED: {
        label: "ยกเลิก",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
    },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
    SUCCESS: { label: "ชำระแล้ว", color: "bg-green-100 text-green-700" },
    PENDING: { label: "รอชำระ", color: "bg-yellow-100 text-yellow-700" },
    CANCEL: { label: "ยกเลิก", color: "bg-red-100 text-red-700" },
};

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
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">พื้นที่ของฉัน</h1>
                    <p className="mt-1 text-gray-500">
                        รายการจองพื้นที่ทั้งหมดของคุณ
                    </p>
                </div>

                {bookings.length === 0 ? (
                    <div className="rounded-3xl bg-white p-16 text-center shadow-sm ring-1 ring-gray-100">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
                            <ShoppingBag size={36} className="text-orange-500" />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">
                            ยังไม่มีการจอง
                        </h2>
                        <p className="mb-6 text-sm text-gray-500">
                            เริ่มจองพื้นที่ขายของคุณได้เลย!
                        </p>
                        <Link
                            href="/customer#booths"
                            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-700"
                        >
                            ดูพื้นที่ว่าง
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const FALLBACK_STATUS = statusConfig.PENDING!;
                            const FALLBACK_PAYMENT = paymentConfig.PENDING!;
                            const status =
                                statusConfig[booking.booking_status] ?? FALLBACK_STATUS;
                            const payment =
                                paymentConfig[booking.payment_status] ?? FALLBACK_PAYMENT;
                            const StatusIcon = status.icon;
                            const boothImage =
                                booking.booth.images?.[0]?.path ?? "/placeholder-image.jpg";

                            const startDate = new Date(
                                booking.start_date,
                            ).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            });
                            const endDate = new Date(booking.end_date).toLocaleDateString(
                                "th-TH",
                                { day: "numeric", month: "short", year: "numeric" },
                            );

                            const isPending = booking.booking_status === "PENDING";
                            const canReview = booking.booking_status === "COMPLETED" || booking.booking_status === "CONFIRMED";
                            const needsPayment = booking.payment_status === "PENDING";
                            const isCancelling = cancellingId === booking.id;

                            return (
                                <div
                                    key={booking.id}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Booth Image */}
                                        <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-48">
                                            <Image
                                                src={boothImage}
                                                alt={booking.booth.name}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-1 flex-col justify-between p-5">
                                            <div>
                                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.color}`}
                                                    >
                                                        <StatusIcon size={12} />
                                                        {status.label}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${payment.color}`}
                                                    >
                                                        {payment.label}
                                                    </span>
                                                </div>

                                                <h3 className="mb-2 text-lg font-bold text-gray-900">
                                                    {booking.booth.name}
                                                </h3>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-orange-500" />
                                                        {startDate} — {endDate}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-blue-500" />
                                                        ตลาด Ozone One
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                                                <div>
                                                    <p className="text-xs text-gray-400">ยอดรวม</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        ฿{booking.total_price.toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* ดูสลิป */}
                                                    {booking.payment_slip_url && (
                                                        <a
                                                            href={booking.payment_slip_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:border-orange-300 hover:text-orange-600"
                                                        >
                                                            ดูสลิป
                                                        </a>
                                                    )}

                                                    {/* ปุ่มชำระเงิน — สำหรับ booking ที่รอดำเนินการ / รอชำระ */}
                                                    {isPending && needsPayment && (
                                                        <button
                                                            onClick={() => setPaymentBooking(booking)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-green-700"
                                                        >
                                                            <CreditCard size={14} />
                                                            ชำระเงิน
                                                        </button>
                                                    )}

                                                    {/* ปุ่มรีวิว — สำหรับ booking ที่ confirmed/completed */}
                                                    {canReview && (
                                                        <button
                                                            onClick={() => setReviewBooking(booking)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-100"
                                                        >
                                                            <MessageSquare size={14} />
                                                            รีวิว
                                                        </button>
                                                    )}

                                                    {/* ปุ่มยกเลิก — สำหรับ booking ที่ PENDING */}
                                                    {isPending && (
                                                        confirmCancelId === booking.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleCancel(booking.id)}
                                                                    disabled={isCancelling}
                                                                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                                                >
                                                                    {isCancelling ? "กำลังยกเลิก..." : "ยืนยัน?"}
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmCancelId(null)}
                                                                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100"
                                                                >
                                                                    ไม่
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmCancelId(booking.id)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100"
                                                            >
                                                                <Trash2 size={14} />
                                                                ยกเลิก
                                                            </button>
                                                        )
                                                    )}
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

            {/* Payment Modal */}
            {paymentBooking && (
                <PaymentModal
                    booking={paymentBooking}
                    onClose={() => setPaymentBooking(null)}
                    onSuccess={() => setPaymentBooking(null)}
                />
            )}

            {/* Write Review Modal */}
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
