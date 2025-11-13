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
  Building2,
  Target,
  Users,
  HeartPulse,
  Flame,
  ClipboardCheck,
  Search,
  BookOpen,
  Zap,
  Scale,
  Leaf,
  Mail,
  MapPin,
  FileStack,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export function HMSApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Oversikt', 'Bedrift & Personale']);

  const navigationGroups = [
    {
      title: 'Oversikt',
      titleAr: 'نظرة عامة',
      items: [
        { id: 'dashboard', name: 'Dashboard', nameAr: 'لوحة التحكم', icon: LayoutDashboard },
        { id: 'goals', name: 'HMS Målsetting', nameAr: 'أهداف HMS', icon: Target },
      ]
    },
    {
      title: 'Bedrift & Personale',
      titleAr: 'الشركة والموظفين',
      items: [
        { id: 'company', name: 'Firmaopplysninger', nameAr: 'معلومات الشركة', icon: Building2 },
        { id: 'employees', name: 'Personale', nameAr: 'الموظفين', icon: Users },
        { id: 'health-service', name: 'Bedriftshelsetjeneste', nameAr: 'الصحة المهنية', icon: HeartPulse },
      ]
    },
    {
      title: 'Sikkerhet & Miljø',
      titleAr: 'السلامة والبيئة',
      items: [
        { id: 'work-environment', name: 'Arbeidsmiljø', nameAr: 'بيئة العمل', icon: Shield },
        { id: 'fire-safety', name: 'Brannsikkerhet', nameAr: 'السلامة من الحرائق', icon: Flame },
        { id: 'risk-analysis', name: 'Risikoanalyse', nameAr: 'تحليل المخاطر', icon: ClipboardCheck },
        { id: 'environment', name: 'Ytre Miljø', nameAr: 'البيئة الخارجية', icon: Leaf },
      ]
    },
    {
      title: 'Avvik & Hendelser',
      titleAr: 'الانحرافات والحوادث',
      items: [
        { id: 'incidents', name: 'Hendelser', nameAr: 'الحوادث', icon: AlertTriangle },
        { id: 'deviations', name: 'Avviksbehandling', nameAr: 'معالجة الانحرافات', icon: ClipboardCheck },
      ]
    },
    {
      title: 'Revisjon & Kontroll',
      titleAr: 'المراجعة والرقابة',
      items: [
        { id: 'internal-audit', name: 'Internrevisjon', nameAr: 'المراجعة الداخلية', icon: Search },
        { id: 'electrical', name: 'Elektrisk Anlegg', nameAr: 'النظام الكهربائي', icon: Zap },
        { id: 'maintenance', name: 'Vedlikehold', nameAr: 'الصيانة', icon: Wrench },
      ]
    },
    {
      title: 'Opplæring & Lover',
      titleAr: 'التدريب والقوانين',
      items: [
        { id: 'training', name: 'Opplæring', nameAr: 'التدريب', icon: GraduationCap },
        { id: 'laws', name: 'Lover og Forskrifter', nameAr: 'القوانين واللوائح', icon: Scale },
        { id: 'gdpr', name: 'Personvern (GDPR)', nameAr: 'حماية البيانات', icon: Shield },
      ]
    },
    {
      title: 'Dokumenter & Rapporter',
      titleAr: 'المستندات والتقارير',
      items: [
        { id: 'reports', name: 'Rapporter', nameAr: 'التقارير', icon: FileText },
        { id: 'documents', name: 'Dokumenter', nameAr: 'المستندات', icon: FileStack },
        { id: 'correspondence', name: 'Korrespondanse', nameAr: 'المراسلات', icon: Mail },
        { id: 'drawings', name: 'Tegninger', nameAr: 'الخرائط', icon: MapPin },
      ]
    }
  ];

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const PlaceholderView = ({ icon: Icon, title, titleAr, description }: any) => (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-10 h-10 text-purple-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-xl text-slate-600 mb-4">{titleAr}</p>
      <p className="text-slate-500 max-w-md mx-auto">{description || 'Kommer snart - قريباً'}</p>
    </div>
  );

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

      case 'goals':
        return <PlaceholderView
          icon={Target}
          title="HMS Målsetting"
          titleAr="أهداف نظام HMS"
          description="Definer og følg opp HMS-målene for bedriften"
        />;
      case 'employees':
        return <PlaceholderView
          icon={Users}
          title="Personale"
          titleAr="إدارة الموظفين"
          description="Administrer ansatte, arbeidsavtaler, timelister og sykefravær"
        />;
      case 'health-service':
        return <PlaceholderView
          icon={HeartPulse}
          title="Bedriftshelsetjeneste"
          titleAr="خدمة الصحة المهنية"
          description="BHT-avtale, førstehjelpsutstyr og forsikringer"
        />;
      case 'work-environment':
        return <PlaceholderView
          icon={Shield}
          title="Arbeidsmiljø"
          titleAr="بيئة العمل"
          description="Driftsinstrukser og arbeidsmiljørutiner for personalet"
        />;
      case 'fire-safety':
        return <PlaceholderView
          icon={Flame}
          title="Brannsikkerhet"
          titleAr="السلامة من الحرائق"
          description="Branninstruks og sjekklister for brannsikkerhet"
        />;
      case 'risk-analysis':
        return <PlaceholderView
          icon={ClipboardCheck}
          title="Risikoanalyse"
          titleAr="تحليل المخاطر"
          description="Kartlegg risikoer og lag handlingsplaner"
        />;
      case 'environment':
        return <PlaceholderView
          icon={Leaf}
          title="Ytre Miljø"
          titleAr="البيئة الخارجية"
          description="Bærekraft og miljøtiltak"
        />;
      case 'deviations':
        return <PlaceholderView
          icon={ClipboardCheck}
          title="Avviksbehandling"
          titleAr="معالجة الانحرافات"
          description="Håndter avvik og korrigerende tiltak"
        />;
      case 'internal-audit':
        return <PlaceholderView
          icon={Search}
          title="Internrevisjon"
          titleAr="المراجعة الداخلية"
          description="HMS-runden og internrevisjonsrapporter"
        />;
      case 'electrical':
        return <PlaceholderView
          icon={Zap}
          title="Elektrisk Anlegg"
          titleAr="النظام الكهربائي"
          description="Kontroll og egenkontroll av elektrisk anlegg"
        />;
      case 'laws':
        return <PlaceholderView
          icon={Scale}
          title="Lover og Forskrifter"
          titleAr="القوانين واللوائح"
          description="Relevant lovverk for HMS i restaurantbransjen"
        />;
      case 'gdpr':
        return <PlaceholderView
          icon={Shield}
          title="Personvern (GDPR)"
          titleAr="حماية البيانات الشخصية"
          description="Internkontroll for personopplysningsforskriften §3"
        />;
      case 'documents':
        return <PlaceholderView
          icon={FileStack}
          title="Dokumenter"
          titleAr="إدارة المستندات"
          description="Dokumentstyring og arkiv"
        />;
      case 'correspondence':
        return <PlaceholderView
          icon={Mail}
          title="Korrespondanse"
          titleAr="المراسلات"
          description="Brev med Arbeidstilsynet og verneombud"
        />;
      case 'drawings':
        return <PlaceholderView
          icon={MapPin}
          title="Tegninger"
          titleAr="الخرائط والمخططات"
          description="Layout-tegninger og planer"
        />;

      default:
        return <HMSDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 overflow-y-auto`}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">HMS System</h1>
              <p className="text-xs text-slate-600">نظام الصحة والبيئة</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            return (
              <div key={group.title} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{group.title}</span>
                    <span className="text-xs text-slate-500">{group.titleAr}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-2 space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                          currentView === item.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{item.name}</div>
                          <div className="text-xs opacity-75 truncate">{item.nameAr}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 mt-auto">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-900 text-sm">HMS Compliance</span>
            </div>
            <p className="text-xs text-purple-700">
              I henhold til Arbeidstilsynet og Mattilsynet forskrifter
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-72">
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
                weekday: 'long',
                year: 'numeric',
                month: 'long',
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
                نظام الصحة والبيئة والسلامة - I henhold til Arbeidstilsynet og Mattilsynet
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
