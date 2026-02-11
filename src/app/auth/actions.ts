"use server";
import { signIn, signOut } from "@/server/auth";
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
  console.log("Redirecting for user:", session.user.email, "Role:", role);

  if (role == "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/customer");
  }
}
export async function logout() {
  await signOut({ redirectTo: "/auth/login" });
}
