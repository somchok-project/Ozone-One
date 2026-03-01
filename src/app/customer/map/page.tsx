import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import MarketMap3D from "./_components/MarketMap3D";

export default async function MapPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const booths = await api.booth.getMapData();
  const serialized = JSON.parse(JSON.stringify(booths));

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 pt-20">
      <MarketMap3D booths={serialized} />
    </div>
  );
}
