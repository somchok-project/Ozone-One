"use client";

import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui";
import {
  AuthPageWrapper,
  PasswordInput,
  GoogleButton,
  Divider,
  SubmitButton,
  AuthFooter,
} from "@/components/auth";

export default function LoginPage() {
  return (
    <AuthPageWrapper
      icon={<Lock className="h-6 w-6" />}
      title="ยินดีต้อนรับ"
      subtitle="กรอกข้อมูลด้านล่างเพื่อเข้าสู่บัญชีของคุณ"
    >
      <form className="mt-8 space-y-6">
        <div className="space-y-5">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="อีเมล"
            placeholder="name@example.com"
            prefix={
              <Mail className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-orange-500" />
            }
          />

          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            label="รหัสผ่าน"
            placeholder="••••••••"
            labelRight={
              <Link
                href="/auth/forgot-password"
                className="font-sans text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            }
          />
        </div>

        <SubmitButton>เข้าสู่ระบบ</SubmitButton>
        <Divider text="หรือดำเนินการต่อด้วย" />
        <GoogleButton />
      </form>

      <AuthFooter
        text="ยังไม่มีบัญชีใช่ไหม?"
        linkText="สมัครสมาชิก"
        href="/auth/register"
      />
    </AuthPageWrapper>
  );
}
