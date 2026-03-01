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

  // 1. Clean Data (ลบข้อมูลเก่าทิ้งก่อนตามลำดับ Relation)
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.image.deleteMany();
  await prisma.booth.deleteMany();
  await prisma.zone.deleteMany(); // เพิ่มการลบ Zone
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
      data: { name: "John Customer", email: "john@example.com", password: hashedPassword, role: Role.CUSTOMER, phone_number: "0822222222" },
    }),
    prisma.user.create({
      data: { name: "Jane Smith", email: "jane@example.com", password: hashedPassword, role: Role.CUSTOMER, phone_number: "0833333333" },
    }),
    prisma.user.create({
      data: { name: "Somchai Dee", email: "somchai@example.com", password: hashedPassword, role: Role.CUSTOMER, phone_number: "0844444444" },
    }),
    prisma.user.create({
      data: { name: "Alice Wonderland", email: "alice@example.com", password: hashedPassword, role: Role.CUSTOMER, phone_number: "0855555555" },
    }),
  ]);

  console.log(`✅ ${users.length + 1} Users created`);

  // 3. Create Zones (สร้างข้อมูล Zone ตาม Schema ใหม่)
  const zoneData = [
    { name: "A", desc: "โซนอาหารและเครื่องดื่ม", color: "#FF5733" },
    { name: "B", desc: "โซนเสื้อผ้าแฟชั่น", color: "#33FF57" },
    { name: "C", desc: "โซนงานคราฟต์และของทำมือ", color: "#3357FF" },
    { name: "D", desc: "โซนสินค้าเบ็ดเตล็ด", color: "#F033FF" },
  ];
  const zones = [];

  for (let i = 0; i < zoneData.length; i++) {
    const zone = await prisma.zone.create({
      data: {
        name: `Zone ${zoneData[i]?.name}`,
        description: zoneData[i]?.desc,
        color_code: zoneData[i]?.color,
      },
    });
    // เก็บ index ไว้คำนวณพิกัด 3D
    zones.push({ ...zone, zoneIndex: i, rawName: zoneData[i]?.name }); 
  }

  console.log(`✅ ${zones.length} Zones created`);

  // 4. Create Booths across ZONES พร้อมพิกัด 3D และผูก zone_id
  const booths = [];

  for (const zone of zones) {
    for (let i = 1; i <= 5; i++) {
      const isEven = i % 2 === 0;
      
      const posX = zone.zoneIndex * 10;
      const posY = 0;
      const posZ = i * 5; 
      const rotY = zone.zoneIndex % 2 === 0 ? 0 : Math.PI;

      const booth = await prisma.booth.create({
        data: {
          name: `${zone.rawName}${i.toString().padStart(2, "0")} - ${zone.name}`,
          price: 300 + Math.floor(Math.random() * 500),
          dimension: isEven ? "3x3 m" : "2x2 m",
          is_available: Math.random() > 0.3,
          
          latitude: 13.756 + Math.random() * 0.01,
          longitude: 100.501 + Math.random() * 0.01,
          
          model_url: isEven ? "/models/booth-large.glb" : "/models/booth-small.glb",
          position_x: posX, // แก้ไขตรงนี้ให้ตรงกับ Schema
          position_y: posY,
          position_z: posZ,
          rotation_y: rotY,
          scale: 1.0,

          zone_id: zone.id, // ผูก Relation กับ Zone
          user_id: admin.id,
        },
      });
      booths.push(booth);
    }
  }

  console.log(`✅ ${booths.length} Booths created with 3D Coordinates`);

  // 5. Create Bookings (Mixed statuses and dates)
  const bookingData = [];
  const now = new Date();
  
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
      payment_slip_url: `https://example.com/slips/slip_${i}.png`
    });
  }

  for (let i = 0; i < 5; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)]!;
    const randomBooth = booths[Math.floor(Math.random() * booths.length)]!;
    const futureDays = Math.floor(Math.random() * 10) + 1;
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

  // 6. Create Reviews
  const reviewCreators = [
    { rating: 5.0, comment: "ทำเลดีมาก คนเดินผ่านเยอะจริงๆ", type: ReviewType.BOOTH },
    { rating: 4.5, comment: "จัดงานดีมาก ตลาดสะอาดครับ", type: ReviewType.MARKET },
    { rating: 4.0, comment: "พนักงานดูแลดีมาก ประทับใจ", type: ReviewType.BOOTH },
    { rating: 5.0, comment: "ราคาคุ้มค่ากับทำเล", type: ReviewType.BOOTH },
    { rating: 4.8, comment: "ระบบจองบูธใช้งานง่ายมาก แผนที่ 3D สวยมาก!", type: ReviewType.MARKET },
  ];

  for (const review of reviewCreators) {
    const randomUser = users[Math.floor(Math.random() * users.length)]!;
    const randomBooth = booths[Math.floor(Math.random() * booths.length)]!;
    
    await prisma.review.create({
      data: {
        rating: review.rating,
        comment: review.comment,
        type: review.type,
        user_id: randomUser.id,
        // ถ้าเป็นประเภท MARKET ไม่จำเป็นต้องส่ง booth_id ไปแล้วตาม Schema ใหม่
        ...(review.type === ReviewType.BOOTH ? { booth_id: randomBooth.id } : {}),
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