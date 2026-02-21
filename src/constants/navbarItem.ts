import {
  Home,
  ShoppingBag,
  LayoutDashboard,
  Users,
  Settings,
  Book
} from "lucide-react";

export const navItemsCustomer = [
  { name: "หน้าหลัก", href: "/customer", icon: Home },
  { name: "พื้นที่ของฉัน", href: "/customer/my-space", icon: ShoppingBag },
];

export const navItemsAdmin = [
  { name: "หน้าหลัก", href: "/admin", icon: Home },
  { name: "แดชบอร์ด", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "จัดการบูธ", href: "/admin/booths", icon: Book },
  { name: "ผู้ใช้", href: "/admin/users", icon: Users },
  { name: "ตั้งค่า", href: "/admin/settings", icon: Settings },
];
