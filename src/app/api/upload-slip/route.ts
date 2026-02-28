import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
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

        // Save file locally
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads", "slips");
        await mkdir(uploadDir, { recursive: true });

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${bookingId}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/slips/${fileName}`;

        // --- SlipOK Verification ---
        const slipOkApiKey = process.env.SLIPOK_API_KEY;
        const slipOkBranchId = process.env.SLIPOK_BRANCH_ID;

        let verified = false;
        let verifyMessage = "";

        if (slipOkApiKey && slipOkBranchId) {
            try {
                const slipFormData = new FormData();
                slipFormData.append("files", file);
                slipFormData.append("amount", booking.total_price.toString());

                const response = await fetch(
                    `https://api.slipok.com/api/line/apikey/${slipOkBranchId}`,
                    {
                        method: "POST",
                        headers: {
                            "x-authorization": slipOkApiKey,
                        },
                        body: slipFormData,
                    },
                );

                const result = await response.json();

                if (response.ok && result.data) {
                    const slipData = result.data;
                    if (
                        slipData.amount &&
                        Number(slipData.amount) >= booking.total_price
                    ) {
                        verified = true;
                        verifyMessage = "สลิปถูกต้อง ยืนยันการชำระเงินเรียบร้อย ✅";
                    } else if (slipData.amount) {
                        verifyMessage = `ยอดเงินไม่ตรง: สลิป ฿${slipData.amount} / ต้องชำระ ฿${booking.total_price}`;
                    } else {
                        verified = true;
                        verifyMessage = "สลิปถูกต้อง ยืนยันการชำระเงินเรียบร้อย ✅";
                    }
                } else {
                    verifyMessage =
                        result.message || "ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่";
                }
            } catch {
                verifyMessage = "เกิดข้อผิดพลาดในการตรวจสอบสลิป";
            }
        } else {
            // No SlipOK configured — auto accept (development mode)
            verified = true;
            verifyMessage = "ยืนยันการชำระเงินสำเร็จ ✅";
        }

        // Update booking
        if (verified) {
            await db.booking.update({
                where: { id: bookingId },
                data: {
                    payment_slip_url: publicUrl,
                    payment_status: "SUCCESS",
                    booking_status: "CONFIRMED",
                },
            });
        } else {
            await db.booking.update({
                where: { id: bookingId },
                data: { payment_slip_url: publicUrl },
            });
        }

        return NextResponse.json({
            verified,
            message: verifyMessage,
            url: publicUrl,
        });
    } catch (err) {
        console.error("Upload slip error:", err);
        return NextResponse.json(
            { verified: false, message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่" },
            { status: 500 },
        );
    }
}
