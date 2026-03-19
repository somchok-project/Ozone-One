import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { uploadToMinio } from "@/lib/minio";

interface PaymentNotificationData {
    customerName: string;
    boothName: string;
    amount: number;
    bookingId: string;
}

/** Send a LINE Flex Message — minimal receipt card style */
async function sendPaymentFlexMessage(data: PaymentNotificationData): Promise<void> {
    const channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const userId = process.env.LINE_ADMIN_USER_ID;
    const adminUrl = process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL}/admin/bookings`
        : "https://your-domain.com/admin/bookings";

    if (!channelToken || !userId) {
        console.warn("LINE env vars not configured — skipping notification");
        return;
    }

    const flexMessage = {
        type: "flex",
        altText: `✅ ยืนยันการชำระเงิน: ฿${data.amount.toLocaleString()}`,
        contents: {
            type: "bubble",
            size: "kilo",
            body: {
                type: "box",
                layout: "vertical",
                contents: [
                    {
                        type: "text",
                        text: "Payment Confirmed",
                        weight: "bold",
                        color: "#1DB446",
                        size: "sm",
                    },
                    {
                        type: "text",
                        text: `฿${data.amount.toLocaleString()}`,
                        weight: "bold",
                        size: "xxl",
                        margin: "md",
                    },
                    {
                        type: "separator",
                        margin: "xxl",
                    },
                    {
                        type: "box",
                        layout: "vertical",
                        margin: "xxl",
                        spacing: "sm",
                        contents: [
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    { type: "text", text: "Customer", size: "sm", color: "#aaaaaa", flex: 1 },
                                    { type: "text", text: data.customerName, size: "sm", color: "#333333", flex: 2, align: "end", wrap: true },
                                ],
                            },
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    { type: "text", text: "Booth", size: "sm", color: "#aaaaaa", flex: 1 },
                                    { type: "text", text: data.boothName, size: "sm", color: "#333333", flex: 2, align: "end", wrap: true },
                                ],
                            },
                            {
                                type: "box",
                                layout: "horizontal",
                                contents: [
                                    { type: "text", text: "Booking ID", size: "sm", color: "#aaaaaa", flex: 1 },
                                    { type: "text", text: data.bookingId, size: "sm", color: "#333333", flex: 2, align: "end" },
                                ],
                            },
                        ],
                    },
                ],
            },
            footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                    {
                        type: "button",
                        style: "primary",
                        color: "#f97316",
                        height: "sm",
                        action: {
                            type: "uri",
                            label: "ดูรายละเอียดในระบบ",
                            uri: adminUrl,
                        },
                    },
                ],
            },
        },
    };

    try {
        const res = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${channelToken}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: [flexMessage],
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`LINE push failed (${res.status}):`, body);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("LINE Notification Network Error:", errorMessage);
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { verified: false, message: "กรุณาเข้าสู่ระบบ" },
                { status: 401 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const bookingId = formData.get("booking_id") as string | null;

        if (!file || !bookingId) {
            return NextResponse.json(
                { verified: false, message: "กรุณาอัปโหลดสลิปและระบุ booking_id" },
                { status: 400 },
            );
        }

        // Verify booking belongs to user
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return NextResponse.json(
                { verified: false, message: "ไม่พบรายการจอง" },
                { status: 404 },
            );
        }

        if (booking.user_id !== session.user.id) {
            return NextResponse.json(
                { verified: false, message: "ไม่มีสิทธิ์" },
                { status: 403 },
            );
        }

        // ── Guard: ถ้า booking ถูก CONFIRMED ไปแล้ว ไม่ให้อัพ slip ซ้ำ ──────
        if (booking.booking_status === "CONFIRMED") {
            return NextResponse.json(
                { verified: false, message: "รายการจองนี้ได้รับการยืนยันแล้ว ไม่สามารถอัปโหลดสลิปซ้ำได้" },
                { status: 400 },
            );
        }

        // ── Upload to MinIO ──────────────────────────────────────────────────
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const objectName = `slips/${bookingId}-${Date.now()}.${ext}`;
        const contentType = file.type || "image/jpeg";

        const publicUrl = await uploadToMinio(objectName, buffer, contentType);

        // ── SlipOK Verification ──────────────────────────────────────────────
        const slipOkApiKey = process.env.SLIPOK_API_KEY;
        const slipOkBranchId = process.env.SLIPOK_BRANCH_ID;

        let verified = false;
        let verifyMessage = "";
        let transRef: string | null = null;

        if (slipOkApiKey && slipOkBranchId) {
            try {
                const slipForm = new FormData();
                // Rebuild the File from buffer so we send the original bytes
                const blob = new Blob([buffer], { type: contentType });
                slipForm.append("files", blob, file.name);
                slipForm.append("amount", booking.total_price.toString());

                const response = await fetch(
                    `https://api.slipok.com/api/line/apikey/${slipOkBranchId}`,
                    {
                        method: "POST",
                        headers: { "x-authorization": slipOkApiKey },
                        body: slipForm,
                    },
                );

                const result = (await response.json()) as {
                    data?: {
                        amount?: string | number;
                        transRef?: string;
                        transDate?: string;
                        transTime?: string;
                        receiver?: {
                            displayName?: string;
                            name?: string;
                            proxy?: { type?: string | null; value?: string | null };
                            account?: { type?: string; value?: string };
                        };
                        sender?: { displayName?: string; name?: string };
                    };
                    message?: string;
                };

                if (response.ok && result.data) {
                    const slipAmount = result.data.amount
                        ? Number(result.data.amount)
                        : null;

                    // ── เก็บ transRef สำหรับเช็ค slip ซ้ำ ──────────────────
                    transRef = result.data.transRef ?? null;

                    // ── เช็คบัญชีผู้รับตรงกับ PromptPay ของร้าน ──────────
                    const expectedPromptPay = process.env.NEXT_PUBLIC_PROMPTPAY_ID ?? "";
                    const expectedSuffix = expectedPromptPay.slice(-4); // เช็คท้าย 4 หลัก
                    const receiverProxy = result.data.receiver?.proxy?.value ?? "";
                    const receiverAccount = result.data.receiver?.account?.value ?? "";
                    const receiverMatches =
                        !expectedSuffix || // ไม่มี config → ข้าม
                        receiverProxy.endsWith(expectedSuffix) ||
                        receiverAccount.replace(/-/g, "").endsWith(expectedSuffix);

                    if (!receiverMatches) {
                        verifyMessage = "สลิปโอนไปยังบัญชีผู้รับที่ไม่ถูกต้อง กรุณาตรวจสอบบัญชีปลายทาง";
                    }
                    // ── เช็คยอดเงินตรง ─────────────────────────────────────
                    else if (slipAmount !== null && slipAmount < booking.total_price) {
                        verifyMessage = `ยอดเงินไม่ตรง: สลิป ฿${slipAmount.toLocaleString()} / ต้องชำระ ฿${booking.total_price.toLocaleString()}`;
                    }
                    // ── เช็ค slip ซ้ำ (transRef เคยถูกใช้แล้ว) ────────────
                    else if (transRef) {
                        const existingBooking = await db.booking.findUnique({
                            where: { payment_trans_ref: transRef },
                        });
                        if (existingBooking) {
                            verifyMessage = "สลิปนี้ถูกใช้ยืนยันการชำระเงินไปแล้ว กรุณาใช้สลิปใหม่";
                        } else {
                            // ── เช็คว่าสลิปไม่เก่าเกิน 24 ชม. ──────────────
                            const slipDate = result.data.transDate;
                            const slipTime = result.data.transTime;
                            if (slipDate && slipTime) {
                                // SlipOK format: transDate = "20260304", transTime = "14:15:00"
                                const year = slipDate.substring(0, 4);
                                const month = slipDate.substring(4, 6);
                                const day = slipDate.substring(6, 8);
                                const transferDate = new Date(`${year}-${month}-${day}T${slipTime}+07:00`);
                                const now = new Date();
                                const hoursDiff = (now.getTime() - transferDate.getTime()) / (1000 * 60 * 60);

                                if (hoursDiff > 24) {
                                    verifyMessage = "สลิปโอนเกิน 24 ชั่วโมงแล้ว กรุณาโอนเงินใหม่และอัปโหลดสลิปใหม่";
                                } else {
                                    verified = true;
                                    verifyMessage = "สลิปถูกต้อง ยืนยันการชำระเงินเรียบร้อย ✅";
                                }
                            } else {
                                // ไม่มีข้อมูลวันที่ — ถือว่าผ่าน
                                verified = true;
                                verifyMessage = "สลิปถูกต้อง ยืนยันการชำระเงินเรียบร้อย ✅";
                            }
                        }
                    } else {
                        // ไม่มี transRef — ถือว่ายอดถูก = ผ่าน
                        verified = true;
                        verifyMessage = "สลิปถูกต้อง ยืนยันการชำระเงินเรียบร้อย ✅";
                    }
                } else {
                    verifyMessage = result.message ?? "ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่";
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.error("SlipOK error:", errorMessage);
                verifyMessage = "เกิดข้อผิดพลาดในการตรวจสอบสลิป";
            }
        } else {
            // Development mode — auto-approve
            verified = true;
            verifyMessage = "ยืนยันการชำระเงินสำเร็จ ✅ (development mode)";
        }

        // ── Update DB & Send LINE Notification ───────────────────────────────
        if (verified) {
            // Optimize: Update and include related data in a single query
            const updatedBooking = await db.booking.update({
                where: { id: bookingId },
                data: {
                    payment_slip_url: publicUrl,
                    payment_status: "SUCCESS",
                    booking_status: "CONFIRMED",
                    ...(transRef ? { payment_trans_ref: transRef } : {}),
                },
                include: {
                    user: { select: { name: true, email: true } },
                    booth: { select: { name: true } },
                },
            });

            if (updatedBooking) {
                const customerName = updatedBooking.user.name ?? updatedBooking.user.email ?? "ไม่ทราบชื่อ";
                const boothName = updatedBooking.booth.name ?? "ไม่ระบุ";

                await sendPaymentFlexMessage({
                    customerName,
                    boothName,
                    amount: booking.total_price,
                    bookingId: bookingId.slice(0, 8).toUpperCase(),
                });
            }
        } else {
            // Save slip URL even if not verified so admin can review manually
            await db.booking.update({
                where: { id: bookingId },
                data: { payment_slip_url: publicUrl },
            });
        }

        return NextResponse.json({ verified, message: verifyMessage, url: publicUrl });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Upload slip error:", errorMessage);

        return NextResponse.json(
            { verified: false, message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" },
            { status: 500 },
        );
    }
}