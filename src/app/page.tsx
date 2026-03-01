import {
  Navbar,
  HeroSection,
  MarketOverview,
  FeaturedBooths,
  Footer,
} from "@/components/landing";
import { Reveal } from "@/components/ui/Reveal";

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800">
      <Navbar />
      <Reveal width="100%" className="block">
        <HeroSection />
      </Reveal>
      <Reveal width="100%" className="block" delay={0.1}>
        <MarketOverview />
      </Reveal>
      <Reveal width="100%" className="block" delay={0.1}>
        <FeaturedBooths searchParams={searchParams as any} />
      </Reveal>
      <Footer />
    </div>
  );
}
