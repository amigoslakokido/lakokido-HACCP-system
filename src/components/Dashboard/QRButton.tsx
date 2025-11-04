import { useState } from 'react';
import { QrCode, X } from 'lucide-react';

interface QRButtonProps {
  language: 'ar' | 'no';
}

export function QRButton({ language }: QRButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/20"
        title={language === 'ar' ? 'رمز QR للموبايل' : 'QR-kode for mobil'}
      >
        <QrCode className="w-5 h-5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-zoom" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900">
                  {language === 'ar' ? 'رمز QR للموبايل' : 'QR-kode for mobil'}
                </h2>
              </div>

              <p className="text-slate-600 text-sm">
                {language === 'ar'
                  ? 'امسح الرمز بكاميرا موبايلك لفتح التطبيق والتقاط الصور للحوادث الحرجة'
                  : 'Skann koden med mobilkameraet for å åpne appen og ta bilder til kritiske hendelser'}
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin)}`}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  {language === 'ar' ? '💡 نصائح:' : '💡 Tips:'}
                </p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• {language === 'ar' ? 'افتح كاميرا الموبايل' : 'Åpne mobilkameraet'}</li>
                  <li>• {language === 'ar' ? 'وجه الكاميرا نحو الرمز' : 'Rett kameraet mot koden'}</li>
                  <li>• {language === 'ar' ? 'اضغط على الإشعار' : 'Trykk på varselet'}</li>
                  <li>• {language === 'ar' ? 'الآن يمكنك التقاط الصور!' : 'Nå kan du ta bilder!'}</li>
                </ul>
              </div>

              <div className="pt-4">
                <p className="text-xs text-slate-500">{language === 'ar' ? 'الرابط:' : 'Link:'}</p>
                <p className="text-sm font-mono text-slate-700 break-all bg-slate-100 rounded-lg p-2 mt-1">
                  {window.location.origin}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoom {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-zoom {
          animation: zoom 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
