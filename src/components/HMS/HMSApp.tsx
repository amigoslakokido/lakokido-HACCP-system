import { Hotel, Calendar, Users, Bed, ClipboardCheck, Star, DollarSign, Clock } from 'lucide-react';

export function HMSApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <Hotel className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">HMS System</h1>
            <p className="text-xl font-bold text-white/90">Hotel Management System</p>
            <p className="text-lg text-white/80 mt-2">نظام إدارة الفنادق</p>
          </div>

          <div className="p-12">
            <div className="text-center mb-12">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  قريباً - Kommer snart
                </p>
              </div>
              <p className="text-gray-600 text-lg">
                نظام إدارة فندقي متكامل قيد التطوير
              </p>
              <p className="text-gray-600 text-lg">
                Et komplett hotellstyringssystem under utvikling
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-900">Reservasjoner</h3>
                    <p className="text-sm text-purple-700">الحجوزات</p>
                  </div>
                </div>
                <p className="text-purple-800 text-sm">
                  Komplett bookingsystem med sanntidsoppdateringer
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border-2 border-pink-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-pink-900">Gjester</h3>
                    <p className="text-sm text-pink-700">النزلاء</p>
                  </div>
                </div>
                <p className="text-pink-800 text-sm">
                  Gjesteadministrasjon og kundehistorikk
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Bed className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">Romadministrasjon</h3>
                    <p className="text-sm text-blue-700">إدارة الغرف</p>
                  </div>
                </div>
                <p className="text-blue-800 text-sm">
                  Romstatus, vedlikehold og tilgjengelighet
                </p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border-2 border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-teal-900">Housekeeping</h3>
                    <p className="text-sm text-teal-700">خدمة التنظيف</p>
                  </div>
                </div>
                <p className="text-teal-800 text-sm">
                  Rengjøringsplan og oppgavefordeling
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border-2 border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">Fakturering</h3>
                    <p className="text-sm text-amber-700">الفوترة</p>
                  </div>
                </div>
                <p className="text-amber-800 text-sm">
                  Betalinger, fakturaer og økonomisk rapportering
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">Anmeldelser</h3>
                    <p className="text-sm text-emerald-700">التقييمات</p>
                  </div>
                </div>
                <p className="text-emerald-800 text-sm">
                  Gjesteanmeldelser og kvalitetskontroll
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-6 text-center text-white">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">Under utvikling</h3>
              <p className="text-white/90 text-lg mb-1">قيد التطوير</p>
              <p className="text-white/80 text-sm mt-3">
                Dette systemet vil være tilgjengelig snart
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
