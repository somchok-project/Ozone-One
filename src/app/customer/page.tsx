import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function CustomerDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Strict check: ADMIN cannot access this page (redirect to admin dashboard)
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          สวัสดี, {session.user.name ?? "Customer"} 👋
        </h1>
        <p className="mt-2 text-orange-100">ยินดีต้อนรับสู่ Ozone One Market</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
          <h3 className="font-semibold text-gray-900">สถานะสมาชิก</h3>
          <p className="mt-2 text-sm text-gray-500">General Member</p>
        </div>
        {/* More customer widgets can go here */}
      </div>
    </div>
  );
}
