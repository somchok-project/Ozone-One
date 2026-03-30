import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import BoothsClient from "./_components/BoothsClient";
import { type Booth, type Zone } from "@/types";

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
    api.booth.getAll(),
    api.booth.getZones(),
  ]);

  const serialized = JSON.parse(JSON.stringify(booths)) as Booth[];
  const serializedZones = JSON.parse(JSON.stringify(zones)) as Zone[];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="mx-auto px-4 sm:px-8 lg:px-8">
        <BoothsClient
          booths={serialized}
          zones={serializedZones}
          initialParams={params}
        />
      </div>
    </div>
  );
}
