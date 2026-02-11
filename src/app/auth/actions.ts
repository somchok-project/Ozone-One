"use server";

import { signIn } from "@/server/auth";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/auth/redirect" });
}

export async function redirectByRole() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = session.user.role;

  if (role == "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/customer");
  }
}
