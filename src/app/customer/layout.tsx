import CustomerNavbar from "@/components/customer/Navbar";
import { auth } from "@/server/auth";
import type { User } from "@/types/index";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar user={session?.user as User} />
      <main>
        <div className="min-h-screen bg-gray-50 font-sans">{children}</div>
      </main>
    </div>
  );
}
