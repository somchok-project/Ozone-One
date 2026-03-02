"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle,
  Loader2,
  QrCode,
  Download,
  UploadCloud,
  ImageIcon,
  AlertCircle,
  Receipt,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID ?? "";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const createBooking = api.booking.create.useMutation({
    onSuccess: (data) => {
      setBookingId(data.id);
      setStep("payment");
    },
  });

  useEffect(() => {
    if (step === "payment") {
      void generateQR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function generateQR() {
    try {
      const generatePayload = (await import("promptpay-qr")).default;
      const QRCode = await import("qrcode");

      const payload = generatePayload(PROMPTPAY_ID, { amount: totalPrice });
      const url = await QRCode.toDataURL(payload, {
        type: "image/png",
        width: 300,
        margin: 1, // ลดขอบขาว QR Code ให้ดูเต็มขึ้น
        color: { dark: "#000000", light: "#ffffff" },
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
    if (file.size > MAX_FILE_BYTES) {
      toast.error("ไฟล์ใหญ่เกิน 5 MB กรุณาเลือกรูปภาพใหม่");
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
    if (!file || !bookingId) return;
    setStep("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("booking_id", bookingId);

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
          errorMsg = `API Error: ${response.status}`;
        }
        setVerifyMessage(errorMsg);
        setStep("error");
        return;
      }

      const result = (await response.json()) as {
        verified: boolean;
        message?: string;
      };

      if (result.verified) {
        setVerifyMessage(result.message ?? "ตรวจสอบสำเร็จ");
        setStep("success");
      } else {
        setVerifyMessage(result.message ?? "ไม่สามารถตรวจสอบสลิปได้");
        setStep("error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setVerifyMessage("ระบบขัดข้อง กรุณาลองใหม่");
      setStep("error");
    }
  }

  // Helper formatting
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="animate-in zoom-in-95 fade-in relative w-full max-w-[420px] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-orange-900/10 duration-200">
        {/* Close button (Floating) */}
        {step !== "uploading" && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/80 text-gray-500 backdrop-blur-md transition-all hover:bg-gray-200 hover:text-gray-900"
          >
            <X size={18} />
          </button>
        )}

        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
          {/* ── STEP 1: CONFIRM ────────────────────────────────────────── */}
          {step === "confirm" && (
            <div className="flex flex-col">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 ring-1 ring-orange-100">
                  <Receipt size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-gray-900">
                  ยืนยันการจองพื้นที่
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  โปรดตรวจสอบรายละเอียดก่อนชำระเงิน
                </p>
              </div>

              {/* Minimal Receipt Card */}
              <div className="mb-8 rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-100">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200/60 pb-4">
                  <span className="text-sm font-medium text-gray-500">
                    พื้นที่
                  </span>
                  <span className="font-bold text-gray-900">{booth.name}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">วันที่จอง</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(startDate)}{" "}
                      <ArrowRight
                        className="mx-1 inline text-gray-300"
                        size={12}
                      />{" "}
                      {formatDate(endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">จำนวนวัน</span>
                    <span className="font-medium text-gray-800">
                      {days} วัน
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ราคา/วัน</span>
                    <span className="font-medium text-gray-800">
                      ฿{booth.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-gray-200/60 pt-4">
                  <span className="text-sm font-bold text-gray-900">
                    ยอดรวมทั้งสิ้น
                  </span>
                  <span className="text-2xl font-black tracking-tight text-orange-600">
                    ฿{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={createBooking.isPending}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:shadow-orange-500/50 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>กำลังสร้างรายการ...</span>
                  </>
                ) : (
                  <>
                    <span>ดำเนินการชำระเงิน</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              {createBooking.error && (
                <p className="mt-4 text-center text-xs font-medium text-red-500">
                  {createBooking.error.message}
                </p>
              )}
            </div>
          )}

          {/* ── STEP 2: PAYMENT & UPLOAD ─────────────────────────────── */}
          {step === "payment" && (
            <div className="flex flex-col">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-extrabold tracking-tight text-gray-900">
                  สแกน & อัปโหลดสลิป
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  รหัสการจอง:{" "}
                  <span className="font-mono text-orange-600">
                    {(bookingId.split("-")[0] || "").toUpperCase()}
                  </span>
                </p>
              </div>

              {/* QR Code Card */}
              <div className="mb-6 flex flex-col items-center rounded-3xl bg-blue-50/50 p-6 ring-1 ring-blue-100/50">
                <div className="mb-4 overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt="PromptPay"
                      className="h-44 w-44 object-contain"
                    />
                  ) : (
                    <div className="flex h-44 w-44 items-center justify-center">
                      <Loader2
                        size={24}
                        className="animate-spin text-gray-300"
                      />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                    PromptPay
                  </p>
                  <p className="text-2xl font-black tracking-tight text-gray-900">
                    ฿{totalPrice.toLocaleString()}
                  </p>
                </div>
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`QR-${bookingId.slice(0, 8)}.png`}
                    className="mt-3 flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-gray-600 shadow-sm ring-1 ring-gray-200/50 transition-all hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Download size={12} />
                    บันทึก QR Code
                  </a>
                )}
              </div>

              {/* Upload Zone */}
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {slipPreview ? (
                  <div className="group relative overflow-hidden rounded-2xl bg-gray-50 ring-2 ring-orange-500 ring-offset-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slipPreview}
                      alt="สลิปที่อัปโหลด"
                      className="mx-auto max-h-48 w-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setSlipPreview("");
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
                      >
                        <Trash2 size={16} /> ลบรูปภาพ
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 transition-all hover:border-orange-400 hover:bg-orange-50"
                  >
                    <div className="mb-3 rounded-full bg-white p-3 shadow-sm ring-1 ring-gray-100">
                      <UploadCloud size={24} className="text-orange-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                      อัปโหลดรูปสลิปโอนเงิน
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-400">
                      JPG หรือ PNG (ไม่เกิน 5MB)
                    </p>
                  </button>
                )}
              </div>

              <button
                onClick={handleUploadSlip}
                disabled={!slipPreview}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all ${
                  slipPreview
                    ? "bg-gray-900 text-white shadow-lg hover:bg-gray-800"
                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                }`}
              >
                <ImageIcon size={18} />
                ยืนยันสลิปและชำระเงิน
              </button>
            </div>
          )}

          {/* ── STEP 3: UPLOADING ──────────────────────────────────────── */}
          {step === "uploading" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-orange-100"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 ring-1 ring-orange-200">
                  <Loader2 size={28} className="animate-spin text-orange-600" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-extrabold tracking-tight text-gray-900">
                กำลังตรวจสอบสลิป...
              </h3>
              <p className="text-sm text-gray-500">
                ระบบกำลังประมวลผลข้อมูล โปรดรอสักครู่
              </p>
            </div>
          )}

          {/* ── STEP 4: SUCCESS ────────────────────────────────────────── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-4 ring-emerald-50/50">
                <CheckCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="mb-2 text-2xl font-black tracking-tight text-gray-900">
                จองสำเร็จ! 🎉
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                ชำระเงินเรียบร้อยแล้ว <br />
                <span className="font-medium text-emerald-600">
                  {verifyMessage}
                </span>
              </p>

              <div className="mb-8 w-full rounded-2xl bg-gray-50 p-4 text-left ring-1 ring-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">พื้นที่</span>
                  <span className="font-bold text-gray-900">{booth.name}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-gray-200/60 pt-3 text-sm">
                  <span className="text-gray-500">สถานะ</span>
                  <span className="font-bold text-emerald-600">
                    ✓ ยืนยันการจองแล้ว
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3">
                <button
                  onClick={() => router.push("/customer/my-space")}
                  className="w-full rounded-2xl bg-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-700 hover:shadow-orange-500/40"
                >
                  ดูพื้นที่ของฉัน
                </button>
                <button
                  onClick={onClose}
                  className="w-full rounded-2xl bg-gray-50 py-3.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: ERROR ──────────────────────────────────────────── */}
          {step === "error" && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 ring-4 ring-red-50/50">
                <AlertCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="mb-2 text-xl font-extrabold tracking-tight text-gray-900">
                ตรวจสอบไม่สำเร็จ
              </h3>
              <p className="mb-8 text-sm text-red-600/80">{verifyMessage}</p>

              <div className="flex w-full flex-col gap-3">
                <button
                  onClick={() => {
                    setSlipPreview("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    setStep("payment");
                  }}
                  className="w-full rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800"
                >
                  อัปโหลดสลิปใหม่
                </button>
                <button
                  onClick={onClose}
                  className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
