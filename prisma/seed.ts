// prisma/seed.ts

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import {
  PrismaClient,
  Role,
  PaymentStatus,
  BookingStatus,
  ReviewType,
} from "../generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Clean Data (ลบข้อมูลเก่าทิ้งก่อน)
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.image.deleteMany();
  await prisma.booth.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await hash("password123", 12);

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin Market",
      email: "admin@market.com",
      password: hashedPassword,
      role: Role.ADMIN,
      phone_number: "0811111111",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "John Customer",
      email: "customer@example.com",
      password: hashedPassword,
      role: Role.CUSTOMER,
      phone_number: "0822222222",
    },
  });

  console.log("✅ Users created");

  // 3. Create Booths (ผูกกับ Admin คนสร้าง)
  const booth1 = await prisma.booth.create({
    data: {
      name: "A01 - โซนแฟชั่น",
      price: 450,
      dimension: "3x3 m",
      is_available: true,
      latitude: 13.7563,
      longitude: 100.5018,
      user_id: admin.id,
    },
  });

  const booth2 = await prisma.booth.create({
    data: {
      name: "B05 - โซนอาหาร",
      price: 600,
      dimension: "2x2 m",
      is_available: true,
      latitude: 13.7565,
      longitude: 100.5020,
      user_id: admin.id,
    },
  });

  console.log("✅ Booths created");

  // 4. Create Images
  await prisma.image.createMany({
    data: [
      { path: "/images/booth-a01.jpg", booth_id: booth1.id },
      { path: "/images/booth-b05.jpg", booth_id: booth2.id },
    ],
  });

  // 5. Create Booking (จำลองการจองที่ผ่านมาแล้ว)
  const booking = await prisma.booking.create({
    data: {
      start_date: new Date("2026-02-01"),
      end_date: new Date("2026-02-05"),
      total_price: 2250,
      payment_status: PaymentStatus.SUCCESS,
      booking_status: BookingStatus.COMPLETED,
      user_id: customer.id,
      booth_id: booth1.id,
    },
  });

  console.log("✅ Bookings created");

  // 6. Create Reviews (แยกประเภทตามที่ต้องการ)
  await prisma.review.createMany({
    data: [
      {
        rating: 5.0,
        comment: "บูธตำแหน่งดีมาก คนเดินผ่านเยอะ",
        type: ReviewType.BOOTH,
        user_id: customer.id,
        booth_id: booth1.id,
      },
      {
        rating: 4.0,
        comment: "ตลาดสะอาด ระบบจัดการดี แต่ที่จอดรถเต็มไว",
        type: ReviewType.MARKET,
        user_id: customer.id,
        booth_id: booth1.id, // อ้างอิงบูธที่เขาเคยจอง
      },
    ],
  });

  console.log("✅ Reviews created");
  console.log("🎉 Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });