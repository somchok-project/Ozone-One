import Link from "next/link";
import { Facebook, Phone } from "lucide-react";

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
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <Link
            href="https://www.facebook.com/Ozoneonenightmarket"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <span className="sr-only">Facebook</span>
            <Facebook className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 text-gray-500">
            <Phone className="h-5 w-5" />
            <span>094-528-5777​</span>
          </div>
          <Link href="#" className="hover:text-orange-600 transition-colors">
            เงื่อนไขการใช้บริการ
          </Link>
          <Link href="#" className="hover:text-orange-600 transition-colors">
            นโยบายความเป็นส่วนตัว
          </Link>
        </div>
      </div>
    </footer>
  );
}
