import { api } from "@/trpc/server";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import MySpaceClient from "@/components/customer/MySpaceClient";

export default async function MySpacePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const bookings = await api.booking.getMyBookings();
  const serialized = JSON.parse(JSON.stringify(bookings));

  return <MySpaceClient bookings={serialized} />;
}
