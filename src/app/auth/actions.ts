"use server";
import { signIn, signOut } from "@/server/auth";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/auth/redirect" });
}

export async function login(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "ข้อมูลไม่ถูกต้อง" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/auth/redirect",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
        default:
          return { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
      }
    }
    throw error;
  }
  return { error: "" };
}

export async function register(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "ข้อมูลไม่ถูกต้อง" };
  }

  const { name, email, password, phone } = validatedFields.data;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "อีเมลนี้ถูกใช้งานแล้ว" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number: phone,
        role: "USER",
      },
    });

    // Login immediately after registration
    // Or redirect to login page
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
  }

  redirect("/auth/login?registered=true");
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
