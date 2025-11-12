import { useState } from 'react';
import { HMSDashboard } from './HMSDashboard';
import { IncidentLogger } from './IncidentLogger';
import { Reports } from './Reports';
import { Training } from './Training';
import { Maintenance } from './Maintenance';
import { CompanySettings } from './CompanySettings';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  GraduationCap,
  Wrench,
  Settings,
  Menu,
  X,
  Shield,
  TrendingUp,
  Building2
} from 'lucide-react';

export function HMSApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', nameAr: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'incidents', name: 'Hendelser', nameAr: 'الحوادث', icon: AlertTriangle },
    { id: 'reports', name: 'Rapporter', nameAr: 'التقارير', icon: FileText },
    { id: 'training', name: 'Opplæring', nameAr: 'التدريب', icon: GraduationCap },
    { id: 'maintenance', name: 'Vedlikehold', nameAr: 'الصيانة', icon: Wrench },
    { id: 'company', name: 'Bedrift', nameAr: 'الشركة', icon: Building2 },
    { id: 'settings', name: 'Innstillinger', nameAr: 'الإعدادات', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <HMSDashboard />;
      case 'incidents':
        return <IncidentLogger />;
      case 'reports':
        return <Reports />;
      case 'training':
        return <Training />;
      case 'maintenance':
        return <Maintenance />;
      case 'company':
        return <CompanySettings />;
      case 'settings':
        return (
          <div className="text-center py-16">
            <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Innstillinger</h2>
            <p className="text-slate-500">Kommer snart - قريباً</p>
          </div>
        );
      default:
        return <HMSDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">HMS System</h1>
                <p className="text-xs text-slate-600 hidden sm:block">نظام الصحة والبيئة والسلامة</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{item.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs opacity-75">{item.nameAr}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-600">
            <p className="font-bold">HMS System - Helse, Miljø og Sikkerhet</p>
            <p className="text-xs mt-1">
              نظام الصحة والبيئة والسلامة - I henhold til Arbeidstilsynet og Mattilsynet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
