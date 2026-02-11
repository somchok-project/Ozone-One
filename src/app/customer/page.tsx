import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  HeroSection,
  MarketOverview,
  FeaturedBooths,
  Footer,
} from "@/components/landing";

export default async function CustomerDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800">
      <HeroSection />
      <MarketOverview />
      <FeaturedBooths />
      <Footer />
    </div>
  );
}
