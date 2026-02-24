import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { BoothHeader } from "./_components/BoothHeader";
import { BoothFilters } from "./_components/BoothFilters";
import { BoothTable } from "./_components/BoothTable";
import { getBooths } from "./actions";

export default async function BoothsPage(props: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const statusFilter = searchParams?.status || "all";

  const booths = await getBooths({
    q: query,
    status: statusFilter,
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <BoothHeader />
        <BoothFilters query={query} statusFilter={statusFilter} />
        <BoothTable booths={booths} />
      </div>
    </div>
  );
}