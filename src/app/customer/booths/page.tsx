import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import BoothsClient from "./_components/BoothsClient";

interface BoothsPageProps {
  searchParams: Promise<{
    zone?: string;
    status?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
  }>;
}

export default async function BoothsPage({ searchParams }: BoothsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const params = await searchParams;

  const [booths, zones] = await Promise.all([
    api.booth.getAll({ zoneId: params.zone }),
    api.booth.getZones(),
  ]);

  const serialized = JSON.parse(JSON.stringify(booths));
  const serializedZones = JSON.parse(JSON.stringify(zones));

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BoothsClient
          booths={serialized}
          zones={serializedZones}
          initialParams={params}
        />
      </div>
    </div>
  );
}
