import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Strict check: Only ADMIN can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/customer");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h1 className="text-2xl font-bold text-gray-900">
          แดชบอร์ดผู้ดูแลระบบ
        </h1>
        <p className="mt-2 text-gray-600">
          ยินดีต้อนรับคุณ{" "}
          <span className="font-semibold text-orange-600">
            {session.user.name ?? "Admin"}
          </span>
        </p>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            สถานะ:{" "}
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
              Active
            </span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Role: <span className="font-mono text-xs">{session.user.role}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Stats Cards Placeholder */}
        {["Verified Users", "Total Bookings", "Revenue"].map((stat) => (
          <div
            key={stat}
            className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5"
          >
            <h3 className="text-sm font-medium text-gray-500">{stat}</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">-</p>
          </div>
        ))}
      </div>
    </div>
  );
}
