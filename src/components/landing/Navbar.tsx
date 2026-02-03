import Link from "next/link";
import Image from "next/image";
import { User, Menu } from "lucide-react"; // เพิ่ม Menu icon สำหรับ mobile

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-orange-100/50 bg-white/90 backdrop-blur-xl transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="shrink-0 cursor-pointer">
            <Image
              src="/images/svg/logo.svg"
              alt="Logo"
              width={120}
              height={60}
              className="h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* 2. Desktop Menu (Center Aligned for Balance) */}
          <div className="hidden items-center space-x-10 md:flex">
            {[
              { name: "ภาพรวมตลาด", href: "#overview" },
              { name: "จองบูธ", href: "#booths" },
              { name: "ติดต่อเรา", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative text-sm font-medium text-slate-600 transition-colors hover:text-orange-600"
              >
                {item.name}
                {/* Minimal Underline Animation */}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* 3. Auth Buttons */}
          <div className="flex items-center space-x-3">
            {/* Login: Minimal Ghost Button */}
            <Link href="/login">
              <button className="hidden cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-orange-50 hover:text-orange-600 md:flex">
                <User size={18} strokeWidth={2.5} />
                <span>เข้าสู่ระบบ</span>
              </button>
            </Link>

            {/* Register: Modern Gradient/Shadow Button */}
            <Link href="/register">
              <button className="group cursor-pointer relative overflow-hidden rounded-full bg-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-orange-500/40">
                <span className="relative z-10">สมัครสมาชิก</span>
              </button>
            </Link>

            {/* Mobile Menu Trigger (Visible only on mobile) */}
            <button className="flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-orange-50 md:hidden">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
