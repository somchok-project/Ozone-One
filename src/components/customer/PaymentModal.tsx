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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID ?? "";

interface PaymentModalProps {
    booking: {
        id: string;
        total_price: number;
        booth: { name: string };
    };
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({
    booking,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const [step, setStep] = useState<"payment" | "uploading" | "success" | "error">("payment");
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [slipPreview, setSlipPreview] = useState<string>("");
    const [verifyMessage, setVerifyMessage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        void generateQR();
        // generateQR reads booking.total_price — regenerate if price ever changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [booking.total_price]);

    async function generateQR() {
        try {
            const generatePayload = (await import("promptpay-qr")).default;
            const QRCode = await import("qrcode");

            const payload = generatePayload(PROMPTPAY_ID, {
                amount: booking.total_price,
            });
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

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) {
            toast.error("ไฟล์ใหญ่เกิน 5 MB กรุณาเลือกไฟล์ขนาดเล็กกว่า");
            e.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSlipPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    }

    async function handleUploadSlip() {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        setStep("uploading");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("booking_id", booking.id);

            const response = await fetch("/api/upload-slip", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = `เกิดข้อผิดพลาด (${response.status})`;
                try {
                    const errorResult = (await response.json()) as { message?: string };
                    errorMsg = errorResult.message ?? errorMsg;
                } catch {
                    errorMsg = `API Error: ${response.status} ${response.statusText}`;
                }
                setVerifyMessage(errorMsg);
                setStep("error");
                return;
            }

            const result = (await response.json()) as { verified: boolean; message?: string };

            if (result.verified) {
                setVerifyMessage(result.message ?? "สำเร็จ");
                setStep("success");
            } else {
                setVerifyMessage(result.message ?? "ไม่สามารถตรวจสอบสลิปได้");
                setStep("error");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setVerifyMessage("เกิดข้อผิดพลาด กรุณาลองใหม่");
            setStep("error");
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                {/* Payment Step */}
                {step === "payment" && (
                    <div>
                        <div className="mb-4 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
                                <QrCode size={24} className="text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                ชำระเงิน — {booking.booth.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                1. สแกน QR จ่ายเงิน → 2. อัปโหลดสลิป
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="mb-4 flex flex-col items-center">
                            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-3">
                                {qrDataUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={qrDataUrl}
                                        alt="PromptPay QR Code"
                                        className="h-48 w-48"
                                    />
                                ) : (
                                    <div className="flex h-48 w-48 items-center justify-center">
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
                                    ฿{booking.total_price.toLocaleString()}
                                </p>
                            </div>
                            {qrDataUrl && (
                                <a
                                    href={qrDataUrl}
                                    download={`payment-${booking.id}.png`}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 underline hover:text-gray-600"
                                >
                                    <Download size={12} />
                                    ดาวน์โหลด QR Code
                                </a>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative my-4">
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
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={slipPreview}
                                        alt="สลิป"
                                        className="mx-auto max-h-36 rounded-lg object-contain"
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
                                    className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center transition-all hover:border-orange-300 hover:bg-orange-50/30"
                                >
                                    <Upload size={22} className="mx-auto mb-2 text-gray-400" />
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

                {/* Uploading */}
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

                {/* Success */}
                {step === "success" && (
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            ชำระเงินสำเร็จ! 🎉
                        </h3>
                        <p className="mb-2 text-sm font-medium text-green-600">
                            {verifyMessage}
                        </p>
                        <p className="mb-6 text-sm text-gray-500">
                            การจองของคุณได้รับการยืนยันเรียบร้อยแล้ว
                        </p>

                        <button
                            onClick={() => {
                                onSuccess();
                                router.refresh();
                            }}
                            className="w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-700"
                        >
                            ปิด
                        </button>
                    </div>
                )}

                {/* Error */}
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
