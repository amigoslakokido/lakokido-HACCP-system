import { useState } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TemperatureControl } from './components/Temperature/TemperatureControl';
import { CleaningTasks } from './components/Cleaning/CleaningTasks';
import { ReportsList } from './components/Reports/ReportsList';
import { SettingsModule } from './components/Settings/SettingsModule';
import { CriticalIncidents } from './components/Incidents/CriticalIncidents';
import { LayoutDashboard, Thermometer, Sparkles, FileText, Settings, Menu, X, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Oversikt', icon: LayoutDashboard },
    { id: 'temperature', name: 'Temperaturkontroll', icon: Thermometer },
    { id: 'cleaning', name: 'Rengjøring', icon: Sparkles },
    { id: 'reports', name: 'Rapporter', icon: FileText },
    { id: 'incidents', name: 'Kritiske hendelser', icon: AlertTriangle },
    { id: 'settings', name: 'Innstillinger', icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'temperature':
        return <TemperatureControl />;
      case 'cleaning':
        return <CleaningTasks />;
      case 'reports':
        return <ReportsList />;
      case 'incidents':
        return <CriticalIncidents />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">HACCP System</h1>
                <p className="text-xs text-slate-600 hidden sm:block">GE Amigos AS</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-emerald-100 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
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
                      ? 'bg-emerald-100 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
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
            <p>HACCP Digital Control System - GE Amigos AS</p>
            <p className="mt-1">Hollendergata 2, 1607 Fredrikstad</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
