"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-sans text-3xl font-bold tracking-tight text-gray-900">
            ยินดีต้อนรับ
          </h2>
          <p className="mt-2 font-sans text-sm text-gray-500">
            กรอกข้อมูลด้านล่างเพื่อเข้าสู่บัญชีของคุณ
          </p>
        </div>

        {/* Form Section */}
        <form className="mt-8 space-y-6">
          <div className="space-y-5">
            {/* Email Input */}
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

            {/* Password Input */}
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              label="รหัสผ่าน"
              placeholder="••••••••"
              prefix={
                <Lock className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-orange-500" />
              }
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer text-gray-400 transition-colors outline-none hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
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

          {/* Submit Button */}
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-4 font-sans text-sm font-semibold text-white shadow-lg shadow-orange-500/20 cursor-pointer transition-all hover:shadow-orange-500/20 active:scale-[0.99]"
          >
            เข้าสู่ระบบ
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 font-sans text-xs text-gray-400">
                หรือดำเนินการต่อด้วย
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 font-sans text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </form>

        {/* Footer */}
        <p className="text-center font-sans text-sm text-gray-500">
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-orange-600 transition-colors hover:text-orange-500 hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}
