import { ClipboardCheck, Hotel } from 'lucide-react';

interface SystemSwitcherProps {
  activeSystem: 'HACCP' | 'HMS';
  onSystemChange: (system: 'HACCP' | 'HMS') => void;
}

export function SystemSwitcher({ activeSystem, onSystemChange }: SystemSwitcherProps) {
  return (
    <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-purple-900 border-b-4 border-white/10 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl border-2 border-white/20">
            <button
              onClick={() => onSystemChange('HACCP')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-bold ${
                activeSystem === 'HACCP'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ClipboardCheck className="w-6 h-6" />
              <div className="text-left">
                <div className="text-lg leading-tight">HACCP System</div>
                <div className="text-xs opacity-80">Food Safety</div>
              </div>
            </button>

            <button
              onClick={() => onSystemChange('HMS')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-bold ${
                activeSystem === 'HMS'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Hotel className="w-6 h-6" />
              <div className="text-left">
                <div className="text-lg leading-tight">HMS System</div>
                <div className="text-xs opacity-80">Hotel Management</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
