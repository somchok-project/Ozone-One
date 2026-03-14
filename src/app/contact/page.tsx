import { Navbar, Footer } from "@/components/landing";
import { Phone, Mail, MapPin, Clock, Facebook } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-25 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            ติดต่อเรา
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Contact Information */}
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 text-orange-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">เบอร์โทรศัพท์</h3>
                  <p className="mt-1 block text-gray-600">
                    094-528-5777
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 text-orange-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Facebook className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Facebook</h3>
                  <a
                    href="https://www.facebook.com/Ozoneonenightmarket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-gray-600 hover:text-blue-600"
                  >
                    Ozone One Market - ตลาดโอโซนวัน ดอนเมือง
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4 text-orange-600">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">ที่ตั้งโครงการ</h3>
                  <p className="mt-1 leading-relaxed text-gray-600">
                    ตลาดโอโซนวัน ดอนเมือง ถนน สรงประภา<br />
                    แขวงดอนเมือง เขตดอนเมือง<br />
                    กรุงเทพมหานคร 10210
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-4 text-orange-600">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">เวลาทำการ</h3>
                  <p className="mt-1 text-gray-600">เปิดทุกวัน 17:00 - 23:00 น.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div className="h-full min-h-[400px] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3872.488887306333!2d100.57647!3d13.929471!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2824d0385cd1f%3A0xc03cf4bfae2ebeeb!2sOzone%20One%20Market%20Don%20Mueang!5e0!3m2!1sen!2sth!4v1773504482661!5m2!1sen!2sth"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[400px] w-full"
            ></iframe>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
