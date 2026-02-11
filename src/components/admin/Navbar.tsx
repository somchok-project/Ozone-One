"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Settings,
} from "lucide-react";
import { logout } from "@/app/auth/actions";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { navItemsAdmin } from "@/constants/navbarItem";
import type { CustomerNavbarProps } from "@/interface/CustomerNavbarProps";

export default function AdminNavbar({ user }: CustomerNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/admin"
            className="group flex items-center gap-2 outline-none"
          >
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-gray-900 transition-opacity group-hover:opacity-80">
                OZONE<span className="text-orange-600">ADMIN</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase">
                Management Portal
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-1 md:flex">
            {navItemsAdmin.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.href)
                      ? "text-orange-500"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Profile Section */}
          <div className="hidden items-center gap-4 md:flex" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 rounded-full border p-1 pr-4 transition-all duration-200 focus:outline-none ${
                  isProfileOpen
                    ? "border-orange-200 bg-orange-50/50 ring-2 ring-orange-100"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-100">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-600">
                      <UserIcon size={18} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start text-xs">
                  <span className="max-w-[100px] truncate font-semibold text-gray-700">
                    {user?.name ?? "Admin"}
                  </span>
                  <span className="font-normal text-gray-400">
                    Administrator
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180 text-orange-500" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="animate-in fade-in zoom-in-95 absolute right-0 mt-3 w-60 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/50 duration-200">
                  <div className="mb-2 px-3 py-2">
                    <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      บัญชีผู้ดูแล
                    </p>
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user?.email}
                    </p>
                  </div>

                  <div className="mx-2 my-1 h-px bg-gray-50" />

                  <Link
                    href="/admin/settings"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={18} />
                    ตั้งค่าระบบ
                  </Link>

                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            className="p-2 text-slate-600 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navItemsAdmin.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
            <div className="my-2 h-px bg-gray-100" />
            <div className="px-4 py-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-600">
                      <UserIcon size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name ?? "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
