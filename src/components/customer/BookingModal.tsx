"use client";

import { useState, useEffect, useRef } from "react";
import {
    X,
    CheckCircle,
    Loader2,
    QrCode,
    Download,
    Upload,
    ImageIcon,
    AlertCircle,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface BookingModalProps {
    booth: {
        id: string;
        name: string;
        price: number;
    };
    startDate: string;
    endDate: string;
    days: number;
    totalPrice: number;
    onClose: () => void;
}

export default function BookingModal({
    booth,
    startDate,
    endDate,
    days,
    totalPrice,
    onClose,
}: BookingModalProps) {
    const [step, setStep] = useState<
        "confirm" | "payment" | "uploading" | "success" | "error"
    >("confirm");
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [bookingId, setBookingId] = useState<string>("");
    const [slipPreview, setSlipPreview] = useState<string>("");
    const [verifyMessage, setVerifyMessage] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const createBooking = api.booking.create.useMutation({
        onSuccess: (data) => {
            setBookingId(data.id);
            setStep("payment");
        },
    });

    // Generate QR code when entering payment step
    useEffect(() => {
        if (step === "payment") {
            generateQR();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    async function generateQR() {
        try {
            const generatePayload = (await import("promptpay-qr")).default;
            const QRCode = await import("qrcode");

            const payload = generatePayload("0622170694", { amount: totalPrice });
            const url = await QRCode.toDataURL(payload, {
                type: "image/png",
                width: 300,
                margin: 2,
                color: { dark: "#1a1a2e", light: "#ffffff" },
            });
            setQrDataUrl(url);
        } catch (err) {
            console.error("QR Generation error:", err);
        }
    }

    function handleConfirmBooking() {
        createBooking.mutate({
            booth_id: booth.id,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
        });
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSlipPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    }

    async function handleUploadSlip() {
        const file = fileInputRef.current?.files?.[0];
        if (!file || !bookingId) return;

        setIsUploading(true);
        setStep("uploading");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("booking_id", bookingId);

            const response = await fetch("/api/upload-slip", {
                method: "POST",
                body: formData,
            });

            // Handle non-OK responses
            if (!response.ok) {
                let errorMsg = `เกิดข้อผิดพลาด (${response.status})`;
                try {
                    const errorResult = await response.json();
                    errorMsg = errorResult.error || errorMsg;
                } catch {
                    // Response wasn't JSON (e.g. 404 HTML page)
                    errorMsg = `API Error: ${response.status} ${response.statusText}`;
                }
                setVerifyMessage(errorMsg);
                setStep("error");
                return;
            }

            const result = await response.json();

            if (result.verified) {
                setVerifyMessage(result.message);
                setStep("success");
            } else {
                setVerifyMessage(result.message || "ไม่สามารถตรวจสอบสลิปได้");
                setStep("error");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setVerifyMessage("เกิดข้อผิดพลาด กรุณาลองใหม่");
            setStep("error");
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative mx-4 w-full max-w-md animate-in zoom-in-95 fade-in duration-200 rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                {/* Step 1: Confirm Booking */}
                {step === "confirm" && (
                    <div>
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                                <QrCode size={28} className="text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">ยืนยันการจอง</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                ตรวจสอบรายละเอียดก่อนดำเนินการ
                            </p>
                        </div>

                        <div className="mb-6 space-y-3 rounded-2xl bg-gray-50 p-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">พื้นที่</span>
                                <span className="font-semibold text-gray-900">
                                    {booth.name}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">วันเริ่มต้น</span>
                                <span className="font-medium text-gray-700">
                                    {new Date(startDate).toLocaleDateString("th-TH", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">วันสิ้นสุด</span>
                                <span className="font-medium text-gray-700">
                                    {new Date(endDate).toLocaleDateString("th-TH", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">จำนวน</span>
                                <span className="font-medium text-gray-700">{days} วัน</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-900">ยอดรวม</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        ฿{totalPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={createBooking.isPending}
                            className="w-full rounded-xl bg-gray-900 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-orange-600 disabled:opacity-50"
                        >
                            {createBooking.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    กำลังดำเนินการ...
                                </span>
                            ) : (
                                "ดำเนินการชำระเงิน"
                            )}
                        </button>

                        {createBooking.error && (
                            <p className="mt-3 text-center text-sm text-red-500">
                                {createBooking.error.message}
                            </p>
                        )}
                    </div>
                )}

                {/* Step 2: QR Code Payment + Slip Upload */}
                {step === "payment" && (
                    <div>
                        <div className="mb-4 text-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                ชำระเงินผ่าน QR Code
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                1. สแกน QR จ่ายเงิน → 2. อัปโหลดสลิป
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="mb-4 flex flex-col items-center">
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-3">
                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt="PromptPay QR Code"
                                        className="h-52 w-52"
                                    />
                                ) : (
                                    <div className="flex h-52 w-52 items-center justify-center">
                                        <Loader2
                                            size={32}
                                            className="animate-spin text-gray-400"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 rounded-xl bg-blue-50 px-4 py-2 text-center">
                                <p className="text-xs font-medium text-blue-600">PromptPay</p>
                                <p className="text-xl font-bold text-blue-900">
                                    ฿{totalPrice.toLocaleString()}
                                </p>
                            </div>
                            {qrDataUrl && (
                                <a
                                    href={qrDataUrl}
                                    download={`payment-${bookingId}.png`}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 underline hover:text-gray-600"
                                >
                                    <Download size={12} />
                                    ดาวน์โหลด QR Code
                                </a>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative my-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white px-3 font-medium text-gray-400 uppercase tracking-wider">
                                    โอนเงินแล้ว ? อัปโหลดสลิป
                                </span>
                            </div>
                        </div>

                        {/* Slip Upload */}
                        <div className="mb-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {slipPreview ? (
                                <div className="relative rounded-xl border-2 border-green-200 bg-green-50/50 p-2">
                                    <img
                                        src={slipPreview}
                                        alt="สลิป"
                                        className="mx-auto max-h-40 rounded-lg object-contain"
                                    />
                                    <button
                                        onClick={() => {
                                            setSlipPreview("");
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-sm hover:bg-gray-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition-all hover:border-orange-300 hover:bg-orange-50/30"
                                >
                                    <Upload
                                        size={24}
                                        className="mx-auto mb-2 text-gray-400"
                                    />
                                    <p className="text-sm font-medium text-gray-600">
                                        กดเพื่อเลือกรูปสลิป
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        รองรับ JPG, PNG (สูงสุด 5MB)
                                    </p>
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleUploadSlip}
                            disabled={!slipPreview}
                            className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-wider transition-all ${slipPreview
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "cursor-not-allowed bg-gray-100 text-gray-400"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <ImageIcon size={18} />
                                ยืนยันและตรวจสอบสลิป
                            </span>
                        </button>
                    </div>
                )}

                {/* Step: Uploading / Verifying */}
                {step === "uploading" && (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                            <Loader2 size={36} className="animate-spin text-blue-600" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">
                            กำลังตรวจสอบสลิป...
                        </h3>
                        <p className="text-sm text-gray-500">
                            ระบบกำลังตรวจสอบสลิปโอนเงินอัตโนมัติ
                        </p>
                    </div>
                )}

                {/* Step: Success */}
                {step === "success" && (
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            จองสำเร็จ! 🎉
                        </h3>
                        <p className="mb-2 text-sm text-green-600 font-medium">
                            {verifyMessage}
                        </p>
                        <p className="mb-6 text-sm text-gray-500">
                            ระบบได้บันทึกการจองของคุณเรียบร้อยแล้ว
                            <br />
                            ท่านสามารถตรวจสอบสถานะได้ที่{" "}
                            <span className="font-medium text-orange-600">
                                &quot;พื้นที่ของฉัน&quot;
                            </span>
                        </p>

                        <div className="mb-6 rounded-2xl bg-green-50 p-4 text-left">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">พื้นที่</span>
                                <span className="font-semibold text-gray-900">
                                    {booth.name}
                                </span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm">
                                <span className="text-gray-500">สถานะ</span>
                                <span className="font-semibold text-green-600">
                                    ✓ ยืนยันแล้ว
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push("/customer")}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                            >
                                กลับหน้าหลัก
                            </button>
                            <button
                                onClick={() => router.push("/customer/my-space")}
                                className="flex-1 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-700"
                            >
                                ดูพื้นที่ของฉัน
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Error */}
                {step === "error" && (
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle size={40} className="text-red-600" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">
                            ตรวจสอบสลิปไม่สำเร็จ
                        </h3>
                        <p className="mb-6 text-sm text-red-500">{verifyMessage}</p>

                        <button
                            onClick={() => {
                                setSlipPreview("");
                                if (fileInputRef.current) fileInputRef.current.value = "";
                                setStep("payment");
                            }}
                            className="w-full rounded-xl bg-gray-900 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-orange-600"
                        >
                            ลองอัปโหลดใหม่
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
