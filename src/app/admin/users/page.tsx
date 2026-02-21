
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCog, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
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

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
      ...(roleFilter !== "all" ? { role: roleFilter as any } : {}),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
            <p className="mt-1 text-sm text-gray-500">
              รายชื่อผู้ใช้งานทั้งหมดในระบบ
            </p>
          </div>
          {/* Optional: Add user button if needed in future */}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SearchInput placeholder="ค้นหาชื่อ, อีเมล..." />
              <div className="flex gap-2">
                <Link href={`/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), role: 'all' }).toString()}`}>
                  <Button variant={roleFilter === 'all' ? 'primary' : 'outline'} size="sm" className="cursor-pointer">
                    ทั้งหมด
                  </Button>
                </Link>
                <Link href={`/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), role: 'ADMIN' }).toString()}`}>
                  <Button variant={roleFilter === 'ADMIN' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer">
                    ผู้ดูแลระบบ
                  </Button>
                </Link>
                <Link href={`/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), role: 'USER' }).toString()}`}>
                  <Button variant={roleFilter === 'USER' ? 'primary' : 'ghost'} size="sm" className="cursor-pointer">
                    ผู้ใช้ทั่วไป
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการผู้ใช้ ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้งาน</TableHead>
                  <TableHead>เบอร์โทรศัพท์</TableHead>
                  <TableHead>สิทธิ์การใช้งาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                          <AvatarFallback>
                            {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {user.name || "ไม่ระบุชื่อ"}
                          </span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.phone_number || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className={
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-50"
                        }
                      >
                        {user.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งานทั่วไป"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                          แก้ไข
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      ไม่พบข้อมูลผู้ใช้งาน
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
