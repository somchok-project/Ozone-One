"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Ruler,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  Navigation,
  MessageSquare,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import BookingModal from "./BookingModal";
import WriteReviewModal from "./WriteReviewModal";
import Image from "next/image";
import { formatCurrency, formatThaiDate } from "@/lib/utils/format";
import { getLabelReviewType } from "@/lib/utils/label";
import { type Review } from "@/types";

export interface BoothDetailProps {
  booth: {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    dimension: string;
    latitude: number | null;
    longitude: number | null;
    images: { id: string; path: string }[];
    reviews: (Omit<Review, "created_at" | "rating" | "user" | "type"> & {
      rating: number;
      type: string;
      created_at: string;
      user: { name: string | null; image: string | null };
    })[];
    bookings: { start_date: string; end_date: string }[];
  };
}

export default function BoothDetail({ booth }: BoothDetailProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const images =
    booth.images.length > 0
      ? booth.images
      : [{ id: "placeholder", path: "/placeholder-image.jpg" }];

  const avgRating = useMemo(() => {
    if (booth.reviews.length === 0) return 0;
    const sum = booth.reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    return sum / booth.reviews.length;
  }, [booth.reviews]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const totalPrice = days * booth.price;
  const today = new Date().toISOString().split("T")[0];

  // Google Maps embed URL
  const mapUrl = useMemo(() => {
    if (!booth.latitude || !booth.longitude) return null;
    const lat = Number(booth.latitude);
    const lng = Number(booth.longitude);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${lat},${lng}&zoom=17&maptype=roadmap`;
  }, [booth.latitude, booth.longitude]);

  // Google Maps link (for "เปิดใน Google Maps" button)
  const mapsLink = useMemo(() => {
    if (!booth.latitude || !booth.longitude) return null;
    return `https://www.google.com/maps?q=${Number(booth.latitude)},${Number(booth.longitude)}`;
  }, [booth.latitude, booth.longitude]);

  function formatDate(dateStr: string) {
    return formatThaiDate(new Date(dateStr));
  }

  return (
    <>
      {/* Back button */}
      <Link
        href="/customer"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-orange-600"
      >
        <ArrowLeft size={16} />
        กลับหน้าหลัก
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left: Gallery + Details + Map + Reviews */}
        <div className="lg:col-span-3">
          {/* Image Gallery */}
          <div className="relative mb-6 h-80 overflow-hidden rounded-2xl bg-gray-200 sm:h-96 lg:h-[420px]">
            <Image
              src={images[currentImage]?.path ?? "/placeholder-image.jpg"}
              alt={booth.name}
              fill
              className="object-cover transition-all duration-500"
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1,
                    )
                  }
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentImage
                          ? "w-6 bg-white"
                          : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Status badge */}
            <div className="absolute top-4 right-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase shadow-sm backdrop-blur-md ${
                  booth.is_available
                    ? "border border-green-200/30 bg-green-500/10 text-green-600"
                    : "border border-red-200/30 bg-red-500/10 text-red-600"
                }`}
              >
                {booth.is_available ? (
                  <>
                    <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                    ว่าง
                  </>
                ) : (
                  "เต็ม"
                )}
              </span>
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImage(idx)}
                  className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                    idx === currentImage
                      ? "ring-2 ring-orange-500 ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.path}
                    alt=""
                    width={80}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Booth info */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {booth.name}
            </h1>

            <div className="mb-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700">
                <Ruler size={16} />
                <span className="font-medium">{booth.dimension}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                <MapPin size={16} />
                <span className="font-medium">ตลาด Ozone One</span>
              </div>
              {booth.reviews.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
                  <Star size={16} className="fill-yellow-400" />
                  <span className="font-medium">
                    {avgRating.toFixed(1)} ({booth.reviews.length} รีวิว)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2 border-t border-gray-50 pt-4">
              <span className="text-4xl font-bold text-gray-900">
                {formatCurrency(booth.price)}
              </span>
              <span className="text-base text-gray-400">/วัน</span>
            </div>
          </div>

          {/* ======= Map Section ======= */}
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Navigation size={18} className="text-blue-500" />
                สถานที่ตั้ง
              </h2>
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-100"
                >
                  <MapPin size={12} />
                  เปิดใน Google Maps
                </a>
              )}
            </div>

            {mapUrl ? (
              <div className="relative h-64 w-full sm:h-80">
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ตำแหน่งบูธ"
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center bg-gray-50 text-sm text-gray-400">
                <MapPin size={20} className="mr-2" />
                ยังไม่มีข้อมูลสถานที่ตั้ง
              </div>
            )}

            {booth.latitude && booth.longitude && (
              <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
                <span className="mr-4">
                  📍 Lat: {Number(booth.latitude).toFixed(6)}
                </span>
                <span>Lng: {Number(booth.longitude).toFixed(6)}</span>
              </div>
            )}
          </div>

          {/* ======= Reviews Section ======= */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <MessageSquare size={18} className="text-orange-500" />
                  รีวิวจากผู้ใช้งาน
                  {booth.reviews.length > 0 && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-600">
                      {booth.reviews.length}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                >
                  <PenLine size={13} />
                  เขียนรีวิว
                </button>
              </div>

              {/* Rating summary */}
              {booth.reviews.length > 0 && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">
                      {avgRating.toFixed(1)}
                    </p>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.round(avgRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    จาก {booth.reviews.length} รีวิว
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              {booth.reviews.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  <MessageSquare
                    size={32}
                    className="mx-auto mb-3 text-gray-200"
                  />
                  ยังไม่มีรีวิวสำหรับบูธนี้
                </div>
              ) : (
                <div className="space-y-5">
                  {booth.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-gray-50 bg-gray-50/50 p-4 transition-all hover:bg-gray-50"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {review.user.image ? (
                            <Image
                              src={review.user.image}
                              alt=""
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                              <User size={16} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {review.user.name ?? "ลูกค้า"}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={11}
                                    className={
                                      i < Number(review.rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-200"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-medium text-gray-400">
                                {Number(review.rating).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                              review.type === "BOOTH"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-purple-50 text-purple-600"
                            }`}
                          >
                            {getLabelReviewType(
                              review as any as Parameters<
                                typeof getLabelReviewType
                              >[0],
                            )}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-2 pl-12 text-sm leading-relaxed text-gray-600">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Booking form */}
        <div className="lg:col-span-2">
          <div className="sticky top-28 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
            <h2 className="mb-1 text-xl font-bold text-gray-900">
              จองพื้นที่นี้
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              เลือกวันที่ต้องการเช่าพื้นที่
            </p>

            <div className="mb-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Calendar size={14} className="mr-1 inline" />
                  วันเริ่มต้น
                </label>
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate("");
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Calendar size={14} className="mr-1 inline" />
                  วันสิ้นสุด
                </label>
                <input
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Price summary */}
            {days > 0 && (
              <div className="mb-6 rounded-xl bg-orange-50/50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {formatCurrency(booth.price)} × {days} วัน
                  </span>
                  <span className="font-medium">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <div className="border-t border-orange-100 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      ยอดรวมทั้งหมด
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              disabled={days === 0 || !booth.is_available}
              onClick={() => setShowBookingModal(true)}
              className={`w-full rounded-xl py-4 text-sm font-bold tracking-wider uppercase transition-all ${
                days > 0 && booth.is_available
                  ? "bg-gray-900 text-white shadow-lg hover:bg-orange-600 hover:shadow-orange-200"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              }`}
            >
              {booth.is_available ? (
                days > 0 ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    จองพื้นที่นี้
                  </span>
                ) : (
                  "กรุณาเลือกวันที่"
                )
              ) : (
                "พื้นที่นี้เต็มแล้ว"
              )}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              ยังไม่ถูกเรียกเก็บเงินจนกว่าจะยืนยันการชำระ
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          booth={booth}
          startDate={startDate}
          endDate={endDate}
          days={days}
          totalPrice={totalPrice}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <WriteReviewModal
          boothId={booth.id}
          boothName={booth.name}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}
