import AdminNavbar from "@/components/admin/Navbar";
import { auth } from "@/server/auth";
import type { User } from "@/types/index";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar user={session?.user as User} />
      <main>
        <div className="min-h-screen bg-gray-50 font-sans">{children}</div>
      </main>
    </div>
  );
}
