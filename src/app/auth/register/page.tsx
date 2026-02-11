"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui";
import {
  AuthPageWrapper,
  PasswordInput,
  GoogleButton,
  Divider,
  SubmitButton,
  AuthFooter,
} from "@/components/auth";

export default function RegisterPage() {
  return (
    <AuthPageWrapper
      icon={<Mail className="h-6 w-6" />}
      title="สร้างบัญชีใหม่"
      subtitle="เริ่มต้นค้นหาพื้นที่ขายที่เหมาะกับคุณ"
    >
      <form className="mt-8 space-y-6">
        <div className="space-y-5">
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            label="เบอร์โทรศัพท์"
            placeholder="0812345678"
            prefix={
              <Phone className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-orange-500" />
            }
          />

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
            required
            label="รหัสผ่าน"
            placeholder="อย่างน้อย 8 ตัวอักษร"
          />

          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            label="ยืนยันรหัสผ่าน"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500/20"
            required
          />
          <label
            htmlFor="terms"
            className="font-sans text-sm leading-snug text-gray-500"
          >
            ฉันยอมรับ{" "}
            <Link
              href="/terms"
              className="font-medium text-orange-500 transition-colors hover:text-orange-600 hover:underline"
            >
              ข้อกำหนดการใช้งาน
            </Link>{" "}
            และ{" "}
            <Link
              href="/privacy"
              className="font-medium text-orange-500 transition-colors hover:text-orange-600 hover:underline"
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </label>
        </div>

        <SubmitButton>สมัครสมาชิก</SubmitButton>
      </form>

      <Divider />
      <GoogleButton label="สมัครด้วย Google" />

      <AuthFooter
        text="มีบัญชีอยู่แล้ว?"
        linkText="เข้าสู่ระบบ"
        href="/auth/login"
      />
    </AuthPageWrapper>
  );
}
