"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  navItems?: NavItem[];
  logoSrc?: string;
  logoAlt?: string;
  brandName?: string;
}

const defaultNavItems: NavItem[] = [
  { label: "จัดการบูธ", href: "/booths" },
  { label: "รายการจอง", href: "/bookings" },
  { label: "รายงาน", href: "/reports" },
];

export function Navbar({
  navItems = defaultNavItems,
  logoSrc = "/images/logo.svg",
  logoAlt = "SpotRent Logo",
  brandName,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b bg-white transition-all duration-300 ease-in-out ${
        isScrolled
          ? "border-gray-200 shadow-md"
          : "border-gray-100 shadow-sm"
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={140}
                height={35}
                priority
                className="h-9 w-auto"
              />
              {brandName && (
                <span className="text-xl font-bold text-gray-900">
                  {brandName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-600"
                  }`}
                >
                  <span className="flex items-center gap-2 transition-transform duration-200 group-hover:scale-105">
                    {item.icon}
                    {item.label}
                  </span>
                  <span
                    className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-orange-600 transition-all duration-300 ${
                      isActive(item.href) ? "w-8 opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu & Mobile Button */}
          <div className="flex items-center gap-4">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-all duration-200 hover:scale-105 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="relative h-6 w-6">
                <X
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMobileMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"}`}
                />
                <Menu
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMobileMenuOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`overflow-hidden border-t border-gray-100 transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2 py-4">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
                }`}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
