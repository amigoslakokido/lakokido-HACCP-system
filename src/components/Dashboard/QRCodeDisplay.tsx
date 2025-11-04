import { useState, useEffect } from 'react';
import { QrCode, Smartphone } from 'lucide-react';

export function QRCodeDisplay() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const currentUrl = window.location.origin;

  useEffect(() => {
    const generateQR = async () => {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;
      setQrCodeUrl(qrApiUrl);
    };

    generateQR();
  }, [currentUrl]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">QR-kode for mobiltilgang</h3>
          <p className="text-sm text-slate-600">Skann for å åpne på mobiltelefon</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-100">
        <div className="flex flex-col items-center gap-4">
          {qrCodeUrl ? (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
              <QrCode className="w-16 h-16 text-slate-400" />
            </div>
          )}

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-indigo-600">
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">Skann med mobilkamera</span>
            </div>
            <p className="text-xs text-slate-600 max-w-xs">
              Mobilversjonen lar deg ta bilder direkte med kameraet for å laste opp til kritiske hendelser
            </p>
          </div>

          <div className="w-full pt-4 border-t border-indigo-200">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-slate-500 text-center mb-1">Nettadresse:</p>
              <p className="text-sm font-mono text-slate-700 text-center break-all">
                {currentUrl}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex gap-2">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Tips for bruk på mobil:</p>
            <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc list-inside">
              <li>Åpne kameraappen på mobilen din</li>
              <li>Rett kameraet mot QR-koden</li>
              <li>Trykk på varselet som dukker opp</li>
              <li>Nå kan du ta bilder direkte i appen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
