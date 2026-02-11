import CustomerNavbar from "@/components/customer/Navbar";
import { auth } from "@/server/auth";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar user={session?.user} />
      <main>
        <div className="min-h-screen bg-gray-50 font-sans">{children}</div>
      </main>
    </div>
  );
}
