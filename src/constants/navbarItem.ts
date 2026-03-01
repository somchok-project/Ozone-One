import {
  LayoutDashboard,
  Users,
  Warehouse,
  Home,
  ShoppingBag,
  Settings,
  CalendarCheck,
  Map,
  Store,
  Layers,
  Star,
  BookOpen,
} from "lucide-react";

export const navItemsCustomer = [
  { name: "หน้าหลัก", href: "/customer", icon: Home },
  { name: "ค้นหาบูธ", href: "/customer/booths", icon: Store },
  { name: "แผนผัง 3D", href: "/customer/map", icon: Map },
  { name: "พื้นที่ของฉัน", href: "/customer/my-space", icon: ShoppingBag },
];

export const navItemsAdmin = [
  { name: "แดชบอร์ด", href: "/admin", icon: LayoutDashboard },
  { name: "จัดการบูธ", href: "/admin/booths", icon: Warehouse },
  { name: "โซน", href: "/admin/zones", icon: Layers },
  { name: "การจอง", href: "/admin/bookings", icon: BookOpen },
  { name: "รีวิว", href: "/admin/reviews", icon: Star },
  { name: "ผู้ใช้งาน", href: "/admin/users", icon: Users },
];
