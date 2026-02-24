/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import {
  PrismaClient,
  Role,
  // BoothType,
  PaymentStatus,
} from "../generated/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean existing data ───
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.image.deleteMany();
  await prisma.booth.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───
  const hashedPassword = await hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Rawipon Ponsarutwanit",
      phone_number: "0812345678",
      password: hashedPassword,
      email: "rawiponponsarutwanit@gmail.com",
      emailVerified: new Date(),
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      phone_number: "0898765432",
      password: hashedPassword,
      email: "rawipon.po@ku.th",
      emailVerified: new Date(),
      role: Role.USER,
    },
  });

  console.log(`  ✅ Created ${2} users`);

  // ─── Booths ───
  const booths = await Promise.all([
    prisma.booth.create({
      data: {
        name: "โซน A - ล็อค 1",
        price: 500,
        is_available: true,
        //type: BoothType.BOOKING,
        latitude: 13.84567891,
        longitude: 100.57234567,
        dimension: "3x3 m",
        user_id: admin.id,
      },
    }),
    prisma.booth.create({
      data: {
        name: "โซน A - ล็อค 2",
        price: 500,
        is_available: true,
        //type: BoothType.BOOKING,
        latitude: 13.84567892,
        longitude: 100.57234568,
        dimension: "3x3 m",
        user_id: admin.id,
      },
    }),
    prisma.booth.create({
      data: {
        name: "โซน B - ล็อค 1",
        price: 300,
        is_available: true,
        // type: BoothType.FREE,
        latitude: 13.84577891,
        longitude: 100.57244567,
        dimension: "2x2 m",
        user_id: admin.id,
      },
    }),
    prisma.booth.create({
      data: {
        name: "โซน B - ล็อค 2",
        price: 300,
        is_available: false,
        // type: BoothType.FREE,
        latitude: 13.84577892,
        longitude: 100.57244568,
        dimension: "2x2 m",
        user_id: admin.id,
      },
    }),
    prisma.booth.create({
      data: {
        name: "โซน C - พรีเมียม",
        price: 1200,
        is_available: true,
        //type: BoothType.BOOKING,
        latitude: 13.84587891,
        longitude: 100.57254567,
        dimension: "4x4 m",
        user_id: admin.id,
      },
    }),
  ]);

  console.log(`  ✅ Created ${booths.length} booths`);

  // ─── Images ───
  const images = await Promise.all(
    booths.flatMap((booth, i) => [
      prisma.image.create({
        data: {
          path: `/images/booths/booth-${i + 1}-1.jpg`,
          booth_id: booth.id,
        },
      }),
      prisma.image.create({
        data: {
          path: `/images/booths/booth-${i + 1}-2.jpg`,
          booth_id: booth.id,
        },
      }),
    ]),
  );

  console.log(`  ✅ Created ${images.length} images`);

  // ─── Bookings ───
  const now = new Date();
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        start_date: new Date(now.getFullYear(), now.getMonth(), 15),
        end_date: new Date(now.getFullYear(), now.getMonth(), 20),
        total_price: 2500,
        payment_status: PaymentStatus.SUCCESS,
        payment_slip_url: "/slips/slip-001.jpg",
        user_id: user.id,
        booth_id: booths[0].id,
      },
    }),
    prisma.booking.create({
      data: {
        start_date: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        end_date: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        total_price: 1500,
        payment_status: PaymentStatus.PENDING,
        payment_slip_url: "/slips/slip-002.jpg",
        user_id: user.id,
        booth_id: booths[2].id,
      },
    }),
    prisma.booking.create({
      data: {
        start_date: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        end_date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        total_price: 6000,
        payment_status: PaymentStatus.CANCEL,
        payment_slip_url: "/slips/slip-003.jpg",
        user_id: user.id,
        booth_id: booths[4].id,
      },
    }),
  ]);

  console.log(`  ✅ Created ${bookings.length} bookings`);

  // ─── Reviews ───
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 4.5,
        comment: "พื้นที่ดีมาก ทำเลสะดวก ลูกค้าเยอะ",
        user_id: user.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5.0,
        comment: "ประทับใจมากครับ บริการเป็นมิตร",
        user_id: user.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 3.5,
        comment: "โดยรวมโอเค แต่ที่จอดรถน้อยไปหน่อย",
        user_id: admin.id,
      },
    }),
  ]);

  console.log(`  ✅ Created ${reviews.length} reviews`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
