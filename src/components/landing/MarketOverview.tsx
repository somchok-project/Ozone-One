import { MapPin, User, Star, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function MarketOverview() {
  return (
    <section id="overview" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              ภาพรวม<span className="text-orange-600 italic">ตลาด</span>
            </h2>
            <p className="mt-4 text-lg font-light text-gray-500">
              ตัวเลขที่ยืนยันความสำเร็จ และบรรยากาศที่ดึงดูดผู้คน
            </p>
          </div>
          <div className="hidden md:block">
            <span className="inline-flex h-px w-32 bg-gray-200"></span>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid h-auto grid-cols-1 gap-4 md:h-[600px] md:grid-cols-3 md:grid-rows-2 lg:gap-8">
          {/* Card 1: Stat (Map/Location) - Main Focus */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-[#FAFAFA] p-8 transition-all hover:shadow-xl md:col-span-1 md:row-span-2">
            <div className="z-10">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-orange-100 p-3 text-orange-600">
                <MapPin size={24} />
              </div>
              <h3 className="text-5xl text-orange-600 font-bold tracking-wide ">
                400+
              </h3>
              <p className="mt-2 text-sm font-medium tracking-wide text-gray-400 uppercase">
                ล็อคและร้านค้า
              </p>
              <p className="mt-4 leading-relaxed text-gray-500">
                รวมร้านค้าหลากหลายสไตล์ ทั้งแฟชั่น อาหาร และงานคราฟต์
                บนพื้นที่จัดสรรอย่างลงตัว
              </p>
            </div>

            {/* Decorative Image at bottom */}
            <div className="relative mt-8 h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src="/images/ฝูงชน.png"
                alt="บรรยากาศตลาด"
                className="h-full w-full object-cover grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
                width={600}
                height={600}
              />
            </div>
          </div>

          {/* Card 2: Pure Image (Aesthetic) */}
          <div className="group relative overflow-hidden rounded-3xl md:col-span-1 md:row-span-1">
            <img
              src="https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=800"
              alt="บรรยากาศ"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 backdrop-blur-md">
                บรรยากาศตลาดกลางคืน
              </span>
            </div>
          </div>

          {/* Card 3: Stat (Users) - Light Orange Theme */}
          <div className="group relative flex flex-col justify-center overflow-hidden rounded-3xl bg-orange-50 p-8 transition-all hover:bg-orange-100/80 md:col-span-1 md:row-span-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className=" text-4xl font-bold text-gray-900">
                  10k+
                </h3>
                <p className="mt-1 text-sm font-medium text-orange-800/70">
                  ผู้เดินตลาดต่อสัปดาห์
                </p>
              </div>
              <div className="rounded-full bg-white p-2 text-orange-600 shadow-sm">
                <User size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              กลุ่มลูกค้าที่มีกำลังซื้อสูงและหมุนเวียนตลอดทั้งสัปดาห์
            </p>
          </div>

          {/* Card 4: Stat (Rating) - Dark/Contrast */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gray-900 p-8 text-white md:col-span-1 md:row-span-1">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Star size={100} strokeWidth={1} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Star className="fill-orange-500 text-orange-500" size={20} />
                <span className="text-sm font-medium text-gray-300">
                  คะแนนรีวิวจากผู้ค้า
                </span>
              </div>
              <h3 className="mt-2  text-4xl font-bold">
                4.8<span className="text-2xl text-gray-500">/5</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 transition-colors group-hover:text-white">
              <span>อ่านรีวิว</span>
              <ArrowUpRight size={16} />
            </div>
          </div>

          {/* Card 5: Image with Overlay */}
          <div className="group relative overflow-hidden rounded-3xl md:col-span-1 md:row-span-1">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800"
              alt="ช้อปปิ้ง"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="font-serif text-xl italic">
                &ldquo;จุดเริ่มต้นที่ดีที่สุด&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
