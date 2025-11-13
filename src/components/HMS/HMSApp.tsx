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
  Menu,
  X,
  Shield,
  Building2,
  Target,
  Users,
  HeartPulse,
  Flame,
  ClipboardCheck,
  Search,
  Zap,
  Scale,
  Leaf,
  Mail,
  MapPin,
  FileStack
} from 'lucide-react';

export function HMSApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', name: '📊 Dashboard', icon: LayoutDashboard, description: 'Oversikt + Analyse + Innsikt' },
    { id: 'goals', name: '🎯 Målsetting', icon: Target, description: 'HMS-mål og policyer' },
    { id: 'company', name: '🏢 Bedrift', icon: Building2, description: 'Firmainfo + Kontakter + Forsikringer' },
    { id: 'employees', name: '👥 Ansatte', icon: Users, description: 'Personale + Kontrakter + Turnus' },
    { id: 'health-safety', name: '🏥 Helse & Sikkerhet', icon: HeartPulse, description: 'BHT + Førstehjelp + Risikoanalyse' },
    { id: 'emergency', name: '🔥 Beredskap', icon: Flame, description: 'Brann + Evakuering + Beredskap' },
    { id: 'training', name: '🎓 Opplæring', icon: GraduationCap, description: 'Kurs + Sertifikater' },
    { id: 'incidents', name: '⚠️ Hendelser', icon: AlertTriangle, description: 'Hendelser + Avvik' },
    { id: 'internal-control', name: '✅ Internkontroll', icon: Search, description: 'Revisjon + Kontroller' },
    { id: 'environment', name: '🌍 Miljø', icon: Leaf, description: 'Miljø + Partnere' },
    { id: 'documents', name: '📁 Dokumenter', icon: FileStack, description: 'Dokumenter + Tegninger' },
    { id: 'compliance', name: '⚖️ Compliance', icon: Scale, description: 'Lovverk + GDPR' },
    { id: 'reports', name: '📊 Rapporter', icon: FileText, description: 'Rapporter + Statistikk' },
  ];

  const PlaceholderView = ({ icon: Icon, name, description }: any) => (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-purple-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">{name}</h2>
      <p className="text-slate-500 max-w-md mx-auto">{description}</p>
      <div className="mt-8">
        <p className="text-sm text-slate-400">Kommer snart</p>
      </div>
    </div>
  );

  const renderView = () => {
    const currentItem = navigationItems.find(item => item.id === currentView);

    switch (currentView) {
      case 'dashboard':
        return <HMSDashboard />;
      case 'company':
        return <CompanySettings />;
      case 'training':
        return <Training />;
      case 'incidents':
        return <IncidentLogger />;
      case 'reports':
        return <Reports />;

      default:
        return currentItem ? (
          <PlaceholderView
            icon={currentItem.icon}
            name={currentItem.name}
            description={currentItem.description}
          />
        ) : <HMSDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto`}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">HMS System</h1>
              <p className="text-xs text-slate-600">Internkontroll</p>
            </div>
          </div>
        </div>

        <nav className="p-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all text-left ${
                currentView === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{item.name.split(' ')[0]}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{item.name.substring(3)}</div>
                <div className={`text-xs truncate ${currentView === item.id ? 'text-white/80' : 'text-slate-500'}`}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-900 text-sm">HMS Compliance</span>
            </div>
            <p className="text-xs text-purple-700">
              Arbeidstilsynet & Mattilsynet
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-bold text-slate-900 lg:hidden">HMS System</h2>
            </div>

            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('nb-NO', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>

        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-slate-600">
              <p className="font-bold">HMS System - Helse, Miljø og Sikkerhet</p>
              <p className="text-xs mt-1">
                I henhold til Arbeidstilsynet og Mattilsynet forskrifter
              </p>
            </div>
          </div>
        </footer>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
