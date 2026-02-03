import {
  Navbar,
  HeroSection,
  MarketOverview,
  FeaturedBooths,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800">
      <Navbar />
      <HeroSection />
      <MarketOverview />
      <FeaturedBooths />
      <Footer />
    </div>
  );
}
