import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

// --- Mock Data (ในระบบจริง ข้อมูลนี้จะดึงมาจาก Prisma: db.booth.findMany) ---
const featuredBooths = [
  {
    id: "1",
    name: "โซน A - หน้าเวที",
    price: 350,
    status: "AVAILABLE",
    image:
      "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800",
    type: "BOOKING",
  },
  {
    id: "2",
    name: "โซน B - อาหารทานเล่น",
    price: 250,
    status: "BOOKED",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    type: "BOOKING",
  },
  {
    id: "3",
    name: "โซน C - เสื้อผ้าแฟชั่น",
    price: 200,
    status: "AVAILABLE",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
    type: "BOOKING",
  },
];

export default function FeaturedBooths() {
  return (
    <section
      id="booths"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            จองบูธยอดนิยม
          </h2>
          <p className="text-gray-500">
            เลือกทำเลที่ดีที่สุดสำหรับธุรกิจของคุณ
          </p>
        </div>
        <Link
          href="/booths"
          className="hidden items-center font-medium text-orange-600 hover:text-orange-700 sm:flex"
        >
          ดูทั้งหมด <ArrowRight size={18} className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuredBooths.map((booth) => (
          <div
            key={booth.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-orange-100/50"
          >
            {/* Image Area */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={booth.image}
                alt={booth.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                    booth.status === "AVAILABLE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {booth.status === "AVAILABLE" ? "ว่าง" : "จองแล้ว"}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col p-6">
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                {booth.name}
              </h3>
              <div className="mb-6 flex items-center text-sm text-gray-500">
                <Store size={16} className="mr-2" />
                <span>ประเภท: {booth.type}</span>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-orange-600">
                    ฿{booth.price}
                  </span>
                  <span className="text-sm text-gray-400">/วัน</span>
                </div>
                {booth.status === "AVAILABLE" ? (
                  <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                    จองเลย
                  </button>
                ) : (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400"
                  >
                    ไม่ว่าง
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/booths"
          className="inline-flex items-center font-medium text-orange-600"
        >
          ดูทั้งหมด <ArrowRight size={18} className="ml-2" />
        </Link>
      </div>
    </section>
  );
}
