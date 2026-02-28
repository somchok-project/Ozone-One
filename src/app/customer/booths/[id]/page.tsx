import { api } from "@/trpc/server";
import BoothDetail from "@/components/customer/BoothDetail";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

interface BoothPageProps {
    params: Promise<{ id: string }>;
}

export default async function BoothPage({ params }: BoothPageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const { id } = await params;

    const booth = await api.booth.getById({ id });

    // Serialize to convert Prisma Decimal → plain number
    // (Decimal can't be passed from Server → Client Component)
    const serializedBooth = JSON.parse(JSON.stringify(booth));

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <BoothDetail booth={serializedBooth} />
            </div>
        </div>
    );
}
