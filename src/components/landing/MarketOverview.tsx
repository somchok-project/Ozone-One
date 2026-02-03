import { MapPin, User, Star } from "lucide-react";

export default function MarketOverview() {
  return (
    <section id="overview" className="border-y border-gray-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex items-center space-x-4 rounded-2xl bg-orange-50/50 p-6">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <MapPin size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">400+</h3>
              <p className="text-gray-500">ล็อคและร้านค้า</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-2xl bg-orange-50/50 p-6">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">10k+</h3>
              <p className="text-gray-500">ผู้เดินตลาดต่อสัปดาห์</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-2xl bg-orange-50/50 p-6">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <Star size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">4.8/5</h3>
              <p className="text-gray-500">คะแนนรีวิวจากผู้ค้า</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
