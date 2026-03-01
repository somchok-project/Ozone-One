import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getZones } from "./actions";
import ZonesList from "./_components/ZonesList";
import { SearchInput } from "@/components/admin/SearchInput";

export default async function ZonesPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const searchParams = await props.searchParams;
  const query = searchParams?.q ?? "";
  const zones = await getZones({ q: query });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              จัดการโซน
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              สร้างและจัดการโซนพื้นที่ภายในตลาด
            </p>
          </div>
          <a
            href="/admin/zones/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 active:scale-95"
          >
            + เพิ่มโซนใหม่
          </a>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchInput placeholder="ค้นหาชื่อโซน..." className="max-w-md" />
        </div>

        <ZonesList zones={zones} />
      </div>
    </div>
  );
}
