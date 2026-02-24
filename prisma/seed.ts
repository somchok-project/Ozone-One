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

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "John Customer",
        email: "john@example.com",
        password: hashedPassword,
        role: Role.CUSTOMER,
        phone_number: "0822222222",
      },
    }),
    prisma.user.create({
      data: {
        name: "Jane Smith",
        email: "jane@example.com",
        password: hashedPassword,
        role: Role.CUSTOMER,
        phone_number: "0833333333",
      },
    }),
    prisma.user.create({
      data: {
        name: "Somchai Dee",
        email: "somchai@example.com",
        password: hashedPassword,
        role: Role.CUSTOMER,
        phone_number: "0844444444",
      },
    }),
    prisma.user.create({
      data: {
        name: "Alice Wonderland",
        email: "alice@example.com",
        password: hashedPassword,
        role: Role.CUSTOMER,
        phone_number: "0855555555",
      },
    }),
  ]);

  console.log(`✅ ${users.length + 1} Users created`);

  // 3. Create Booths across ZONES
  const zones = ["A", "B", "C", "D"];
  const booths = [];

  for (const zone of zones) {
    for (let i = 1; i <= 5; i++) {
      const booth = await prisma.booth.create({
        data: {
          name: `${zone}${i.toString().padStart(2, "0")} - Zone ${zone}`,
          price: 300 + Math.floor(Math.random() * 500),
          dimension: i % 2 === 0 ? "3x3 m" : "2x2 m",
          is_available: true,
          latitude: 13.756 + Math.random() * 0.01,
          longitude: 100.501 + Math.random() * 0.01,
          user_id: admin.id,
        },
      });
      booths.push(booth);
    }
  }

  console.log(`✅ ${booths.length} Booths created`);

  // 4. Create Bookings (Mixed statuses and dates)
  const bookingData = [];
  const now = new Date();
  
  // Past Bookings (Last 2 months)
  for (let i = 0; i < 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)]!;
    const randomBooth = booths[Math.floor(Math.random() * booths.length)]!;
    const daysAgo = Math.floor(Math.random() * 60) + 10;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

    bookingData.push({
      start_date: startDate,
      end_date: endDate,
      total_price: randomBooth.price * 3,
      payment_status: PaymentStatus.SUCCESS,
      booking_status: BookingStatus.COMPLETED,
      user_id: randomUser.id,
      booth_id: randomBooth.id,
      created_at: new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    });
  }

  // Pending Bookings
  for (let i = 0; i < 5; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)]!;
    const randomBooth = booths[Math.floor(Math.random() * booths.length)]!;
    const futureDays = Math.floor(Math.random() * 10);
    const startDate = new Date(now.getTime() + futureDays * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    bookingData.push({
      start_date: startDate,
      end_date: endDate,
      total_price: randomBooth.price * 2,
      payment_status: PaymentStatus.PENDING,
      booking_status: BookingStatus.PENDING,
      user_id: randomUser.id,
      booth_id: randomBooth.id,
    });
  }

  for (const data of bookingData) {
    await prisma.booking.create({ data });
  }

  console.log(`✅ ${bookingData.length} Bookings created`);

  // 5. Create Reviews
  const comments = [
    "ทำเลดีมาก คนเดินผ่านเยอะจริงๆ",
    "จัดงานดีมาก ตลาดสะอาดครับ",
    "พนักงานดูแลดีมาก ประทับใจ",
    "ราคาคุ้มค่ากับทำเล",
    "ระบบจองบูธใช้งานง่ายมาก",
  ];

  const reviewCreators = [
    { rating: 5.0, comment: comments[0], type: ReviewType.BOOTH },
    { rating: 4.5, comment: comments[1], type: ReviewType.MARKET },
    { rating: 4.0, comment: comments[2], type: ReviewType.BOOTH },
    { rating: 5.0, comment: comments[3], type: ReviewType.BOOTH },
    { rating: 4.8, comment: comments[4], type: ReviewType.MARKET },
  ];

  for (const review of reviewCreators) {
    const randomUser = users[Math.floor(Math.random() * users.length)]!;
    const randomBooth = booths[Math.floor(Math.random() * booths.length)]!;
    
    await prisma.review.create({
      data: {
        ...review,
        user_id: randomUser.id,
        booth_id: randomBooth.id,
      },
    });
  }

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