"use client";

import Link from "next/link";
import { LogOut, Home, User, ShoppingBag, Menu } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { useState } from "react";

export default function CustomerNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-orange-100/50 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/customer" className="shrink-0 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-orange-600">
                Ozone Market
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 md:flex">
            {[
              { name: "หน้าหลัก", href: "/customer", icon: Home },
              { name: "ประวัติการจอง", href: "#", icon: ShoppingBag },
              { name: "บัญชีของฉัน", href: "#", icon: User },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-orange-600"
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="hidden md:flex">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            className="p-2 text-slate-600 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
