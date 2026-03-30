import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  HeroSection,
  MarketOverview,
  FeaturedBooths,
  Footer,
} from "@/components/landing";

export default async function CustomerDashboard(props: {
  searchParams?: Promise<{ zone?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800">
      <HeroSection />
      <MarketOverview />
      <FeaturedBooths searchParams={searchParams} />
      <Footer />
    </div>
  );
}
