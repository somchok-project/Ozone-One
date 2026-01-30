# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## How to use Prisma and run Next.js

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่าและใช้งาน Prisma

- แก้ไขการเชื่อมต่อฐานข้อมูลในไฟล์ `prisma/schema.prisma`
- รัน migration เพื่อสร้างตารางในฐานข้อมูล

```bash
npx prisma migrate dev
```

### (ทางเลือก) ใช้ db push เพื่อ sync schema โดยไม่สร้าง migration

```bash
npx prisma db push
```

- สร้าง Prisma Client

```bash
npx prisma generate
```



- เปิด Prisma Studio (GUI สำหรับจัดการฐานข้อมูล)

```bash
npx prisma studio
```

- run seed ต้องสร้างใน prisma/seed
```bash
npx prisma db seed 
```

### 3. รันเซิร์ฟเวอร์ Next.js

```bash
npm run dev
```

แอปจะรันที่ [http://localhost:3000](http://localhost:3000)

---

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.