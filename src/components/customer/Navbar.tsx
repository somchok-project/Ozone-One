"use client";

import Link from "next/link";
import {
  LogOut,
  Home,
  User as UserIcon,
  ShoppingBag,
  Menu,
  ChevronDown,
} from "lucide-react";
import { logout } from "@/app/auth/actions";
import { useState } from "react";
import Image from "next/image";
import type { CustomerNavbarProps } from "@/interface/CustomerNavbarProps";

export default function CustomerNavbar({ user }: CustomerNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-orange-100/50 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/customer" className="shrink-0 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-orange-600">
                Ozone One Market
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-8 md:flex">
            {[
              { name: "หน้าหลัก", href: "/customer", icon: Home },
              { name: "ประวัติการจอง", href: "#", icon: ShoppingBag },
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

          {/* User Profile Dropdown */}
          <div className="hidden md:relative md:flex">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-3 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <UserIcon size={18} />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="p-1">
                  <Link
                    href="#"
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <UserIcon size={16} />
                    ข้อมูลผู้ใช้งาน
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
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
            <div className="flex items-center gap-3 px-3 py-2">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <UserIcon size={20} />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <hr className="my-2 border-gray-100" />
            <Link
              href="#"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              <UserIcon size={18} />
              ข้อมูลผู้ใช้งาน
            </Link>
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
