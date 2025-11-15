import { useState } from 'react';
import { Leaf, Droplet, FileText, Recycle, Sparkles, Car, Target, ArrowLeft } from 'lucide-react';
import { AssistantPanel } from './AssistantPanel';
import { FryingOilManagement } from './Environment/FryingOilManagement';
import { GreaseTrapManagement } from './Environment/GreaseTrapManagement';
import { WasteManagement } from './Environment/WasteManagement';
import { CleaningProducts } from './Environment/CleaningProducts';
import { GreenTransport } from './Environment/GreenTransport';
import { EnvironmentalGoals } from './Environment/EnvironmentalGoals';

export function EnvironmentMain() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    { id: 'frying-oil', name: 'Håndtering av frityrolje', icon: Droplet, color: 'amber' },
    { id: 'grease-trap', name: 'Fettutskiller / NORVA', icon: FileText, color: 'blue' },
    { id: 'waste', name: 'Avfallshåndtering', icon: Recycle, color: 'green' },
    { id: 'cleaning', name: 'Rengjøringsprodukter', icon: Sparkles, color: 'teal' },
    { id: 'transport', name: 'Grønn transport', icon: Car, color: 'emerald' },
    { id: 'goals', name: 'Miljømål', icon: Target, color: 'lime' }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; hover: string }> = {
      amber: { bg: 'bg-white border-gray-200', icon: 'text-amber-600', hover: 'hover:border-amber-300 hover:shadow-md' },
      blue: { bg: 'bg-white border-gray-200', icon: 'text-blue-600', hover: 'hover:border-blue-300 hover:shadow-md' },
      green: { bg: 'bg-white border-gray-200', icon: 'text-green-600', hover: 'hover:border-green-300 hover:shadow-md' },
      teal: { bg: 'bg-white border-gray-200', icon: 'text-teal-600', hover: 'hover:border-teal-300 hover:shadow-md' },
      emerald: { bg: 'bg-white border-gray-200', icon: 'text-emerald-600', hover: 'hover:border-emerald-300 hover:shadow-md' },
      lime: { bg: 'bg-white border-gray-200', icon: 'text-lime-600', hover: 'hover:border-lime-300 hover:shadow-md' }
    };
    return colors[color];
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'frying-oil': return <FryingOilManagement />;
      case 'grease-trap': return <GreaseTrapManagement />;
      case 'waste': return <WasteManagement />;
      case 'cleaning': return <CleaningProducts />;
      case 'transport': return <GreenTransport />;
      case 'goals': return <EnvironmentalGoals />;
      default: return null;
    }
  };

  if (selectedSection) {
    return (
      <div className="space-y-4">
        <AssistantPanel seksjon="miljo" data={{}} />
        <button onClick={() => setSelectedSection(null)} className="text-green-600 hover:text-green-700 flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Tilbake til oversikt
        </button>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Leaf className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Miljø</h1>
            <p className="text-green-50 mt-1">Miljøstyring og bærekraftig drift</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const colors = getColorClasses(section.color);
          return (
            <button key={section.id} onClick={() => setSelectedSection(section.id)} className={`${colors.bg} ${colors.hover} border-2 rounded-xl p-6 text-left transition-all group`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-base">{section.name}</h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
