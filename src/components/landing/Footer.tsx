import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
        <div className="text-center md:text-left">
          <span className="text-xl font-bold text-orange-600">OZONE ONE</span>
          <p className="mt-2 text-sm text-gray-500">
            © 2024 ตลาดโอโซนวัน. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-6 text-sm text-gray-500">
          <Link href="#" className="hover:text-orange-600">
            เงื่อนไขการใช้บริการ
          </Link>
          <Link href="#" className="hover:text-orange-600">
            นโยบายความเป็นส่วนตัว
          </Link>
        </div>
      </div>
    </footer>
  );
}
