import {
  LayoutDashboard,
  Users,
  Warehouse,
  Home,
  ShoppingBag,
  Settings,
  CalendarCheck,
} from "lucide-react";

export const navItemsCustomer = [
  { name: "หน้าหลัก", href: "/customer", icon: Home },
  { name: "จองพื้นที่", href: "/customer#booths", icon: CalendarCheck },
  { name: "พื้นที่ของฉัน", href: "/customer/my-space", icon: ShoppingBag },
];

export const navItemsAdmin = [
  { name: "แดชบอร์ด", href: "/admin", icon: LayoutDashboard },
  { name: "จัดการบูธ", href: "/admin/booths", icon: Warehouse },
  { name: "ผู้ใช้งาน", href: "/admin/users", icon: Users },
];
