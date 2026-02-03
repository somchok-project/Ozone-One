'use client';

import React from 'react';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-8 py-12 lg:px-12">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-orange-600">สมัครบัญชีผู้ใช้ใหม่</h2>
        <p className="mt-2 text-sm text-gray-500">
          สมัครบัญชีผู้ใช้ใหม่เพื่อค้นหาพื้นที่จัดงาน หรือจัดการพื้นที่เช่าของคุณได้เลย
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5">
        
        {/* Username */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">ชื่อผู้ใช้</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="กรอกชื่อผู้ใช้ของคุณ"
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">อีเมล</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="examples@gmail.com"
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">รหัสผ่าน</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="กรอกรหัสผ่านของคุณ"
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">ยืนยันรหัสผ่าน</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="กรอกรหัสผ่านของคุณอีกครั้ง"
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-10 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all mt-6"
        >
          สมัครบัญชี
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Footer Link */}
        <div className="text-center text-sm text-gray-500 mt-4">
          คุณมีบัญชีผู้ใช้อยู่แล้ว ?{' '}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </form>
    </div>
  );
}