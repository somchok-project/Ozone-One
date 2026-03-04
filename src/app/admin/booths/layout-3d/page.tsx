import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { getBoothPositions } from "../actions";
import MarketLayoutClient from "./_components/MarketLayoutClient";

export default async function Layout3DPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const booths = await getBoothPositions();

    // Serialize for client
    const serialized = booths.map((b) => ({
        ...b,
        position_x: b.position_x ?? 0,
        position_y: b.position_y ?? 0,
        position_z: b.position_z ?? 0,
        rotation_y: b.rotation_y ?? 0,
        scale: b.scale ?? 1,
    }));

    return <MarketLayoutClient booths={serialized} />;
}
