import EmailInput from "@/components/auth/EmailInput";
import PasswordInput from "@/components/auth/PasswordInput";
import path from "path/win32";

export default function LoginPage() {
    return (
        <>
            <div className="w-full max-w-xl p-8 bg-white">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.svg" alt="SpotRent Logo" width={220} height={40} />
                </div>
                <div>
                    <h2 className="mt-6 text-3xl font-bold text-slate-900">ยินดีต้อนรับกลับมา</h2>
                    <p className="mt-2 pb-8 text-sm text-slate-600">ค้นหาพื้นที่จัดงาน หรือจัดการพื้นที่เช่าของคุณได้เลย</p>
                </div>
                <form action="#" className="space-y-6" method="POST">
                    <div className="space-y-2">
                        <EmailInput
                            label="อีเมล"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="examples@gmail.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <PasswordInput
                            label="รหัสผ่าน"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="กรอกรหัสผ่านของคุณ"
                            required
                        />
                        <div className="text-right">
                            <a className="text-sm text-orange-600 hover:underline transition-all" href="#">ลืมรหัสผ่าน?</a>
                        </div>
                    </div>
                    <div className="relative flex items-center py-5">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-400">หรือใช้อีเมล</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-400 rounded-2xl text-slate-700 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer" type="button">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        เข้าสู่ระบบด้วย Google
                    </button>
                    <button className="w-full md:full-w-md bg-orange-500 text-white font-bold py-4 px-4 gap-3 rounded-2xl shadow-sm hover:bg-orange-600 transition-all flex items-center justify-center cursor-pointer" type="submit">
                        <span>เข้าสู่ระบบ</span>
                        <svg className="w-6 h-6 text-gray-800 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
                        </svg>
                    </button>
                </form>
                <div className="mt-6 relative flex items-center justify-center">
                    <div className="text-gray-500">ยังไม่มีบัญชี SpotRent?</div>
                    <a className="mx-3 text-orange-600 hover:underline transition-all" href="#">สมัครสมาชิกเลย</a>
                </div>
            </div>
        </>
    );
};