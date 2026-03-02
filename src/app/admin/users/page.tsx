
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Shield, UserCheck, ShoppingBag } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import { db } from "@/server/db";
import { SearchInput } from "@/components/admin/SearchInput";

export default async function UsersPage(props: {
  searchParams?: Promise<{ q?: string; role?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const query = searchParams?.q || "";
  const roleFilter = searchParams?.role || "all";

  const [users, totalCount, adminCount, customerCount] = await Promise.all([
    db.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        ...(roleFilter !== "all" ? { role: roleFilter as any } : {}),
      },
      orderBy: { name: "asc" },
      include: { _count: { select: { bookings: true } } },
    }),
    db.user.count(),
    db.user.count({ where: { role: "ADMIN" } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const stats = [
    { label: "ผู้ใช้ทั้งหมด", value: totalCount, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "ผู้ดูแลระบบ", value: adminCount, icon: Shield, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "ลูกค้าทั่วไป", value: customerCount, icon: UserCheck, color: "text-sky-600", bg: "bg-sky-50" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-350 px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px] mb-1">
            <Users className="h-4 w-4" />
            การจัดการผู้ใช้งาน
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">รายชื่อผู้ใช้งาน</h1>
          <p className="text-slate-500 text-sm mt-1">บริหารจัดการบัญชีและสิทธิ์การใช้งานของผู้ใช้ในระบบ</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{s.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
            {[
              { value: "all", label: "ทั้งหมด" },
              { value: "ADMIN", label: "ผู้ดูแลระบบ" },
              { value: "CUSTOMER", label: "ลูกค้า" },
            ].map(({ value, label }) => (
              <Link
                key={value}
                href={`/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), role: value }).toString()}`}
              >
                <button className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  roleFilter === value
                    ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                    : "text-slate-500 hover:text-orange-500"
                }`}>
                  {label}
                </button>
              </Link>
            ))}
          </div>
          <div className="w-full md:w-90">
            <SearchInput placeholder="ค้นหาชื่อ, อีเมล..." />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="py-5 pl-8 text-slate-500 font-bold text-[11px] uppercase tracking-wider">ผู้ใช้งาน</TableHead>
                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">เบอร์โทรศัพท์</TableHead>
                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">การจอง</TableHead>
                <TableHead className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">สิทธิ์</TableHead>
                <TableHead className="pr-8 text-right text-slate-500 font-bold text-[11px] uppercase tracking-wider">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="group border-b border-slate-50 hover:bg-orange-50/20 transition-colors">
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-xl ring-2 ring-slate-100 group-hover:ring-orange-100 transition-all">
                        <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                        <AvatarFallback className="rounded-xl bg-linear-to-br from-orange-100 to-orange-200 text-orange-600 font-bold text-sm">
                          {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{user.name || "ไม่ระบุชื่อ"}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {user.phone_number ?? <span className="text-slate-300 italic text-xs">ไม่ระบุ</span>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-slate-300" />
                      <span className="text-sm font-bold text-slate-700">{user._count.bookings}</span>
                      <span className="text-xs text-slate-400">รายการ</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                      user.role === "ADMIN"
                        ? "bg-violet-50 text-violet-700"
                        : "bg-sky-50 text-sky-700"
                    }`}>
                      {user.role === "ADMIN" ? "Admin" : "Customer"}
                    </span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Link href={`/admin/users/${user.id}`}>
                      <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600">
                        แก้ไข
                      </button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-slate-400 italic">
                    ไม่พบข้อมูลผู้ใช้งาน
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

