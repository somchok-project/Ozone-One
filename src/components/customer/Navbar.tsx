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
import { navItemsCustomer } from "@/constants/navbarItem";
import type { CustomerNavbarProps } from "@/interface/CustomerNavbarProps";

export default function CustomerNavbar({ user }: CustomerNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* --- Logo --- */}
          <Link href="/customer" className="group flex items-center gap-2 outline-none">
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:opacity-80 transition-opacity">
                OZONE<span className="text-orange-500">ONE</span>
              </span>
              <span className="text-[10px] font-medium text-gray-400 tracking-wider uppercase">
                Customer Portal
              </span>
            </div>
          </Link>

          {/* --- Desktop Navigation --- */}
          <div className="hidden items-center space-x-1 md:flex">
            {navItemsCustomer.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 
                  ${
                    isActive(item.href)
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <item.icon
                  size={18}
                  className={`transition-colors ${
                    isActive(item.href) ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </div>

          {/* --- Desktop Profile Section --- */}
          <div className="hidden md:flex items-center gap-4" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 rounded-full border p-1 pr-4 transition-all duration-200 focus:outline-none
                  ${
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
                  <span className="font-semibold text-gray-700 max-w-[100px] truncate">
                    {user?.name }
                  </span>
                  <span className="text-gray-400 font-normal">Customer</span>
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
                <div className="absolute right-0 mt-3 w-60 origin-top-right animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/50">
                  <div className="mb-2 px-3 py-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">บัญชีของฉัน</p>
                    <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                  
                  <div className="h-px bg-gray-50 mx-2 my-1" />

                  <Link
                    href="/customer/profile"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={18} />
                    ตั้งค่าบัญชี
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

          {/* --- Mobile Menu Button --- */}
          <button
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full animate-in slide-in-from-top-5 duration-200 border-b border-gray-100 bg-white shadow-lg md:hidden">
          <div className="space-y-1 p-4">
            {navItemsCustomer.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors
                  ${
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
               <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                    {user?.image ? (
                        <Image src={user.image} alt="Profile" width={40} height={40} className="object-cover h-full w-full" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-orange-100 text-orange-600"><UserIcon size={20}/></div>
                    )}
                  </div>
                  <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
               </div>
               
               <button
                onClick={() => logout()}
                className="flex w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                <LogOut size={20} />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}