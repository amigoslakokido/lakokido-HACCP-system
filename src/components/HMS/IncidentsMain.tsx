import { useState } from 'react';
import { AlertTriangle, FileText, AlertCircle, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { IncidentRegistration } from './IncidentRegistration';
import { Deviations } from './Deviations';
import { FollowUp } from './FollowUp';

export function IncidentsMain() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'registration',
      name: 'Register Hendelser',
      description: 'Ulykker, personskader, nestenulykker og materiell skade',
      icon: AlertTriangle,
      color: 'orange'
    },
    {
      id: 'deviations',
      name: 'Avvik',
      description: 'Sikkerhet, arbeidsmiljø, brann, utstyr og rutiner',
      icon: AlertCircle,
      color: 'red'
    },
    {
      id: 'followup',
      name: 'Oppfølging',
      description: 'Rotårsaksanalyse og tiltak',
      icon: ClipboardCheck,
      color: 'blue'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; hover: string }> = {
      orange: {
        bg: 'bg-white border-gray-200',
        icon: 'text-orange-600',
        hover: 'hover:border-orange-300 hover:shadow-md'
      },
      red: {
        bg: 'bg-white border-gray-200',
        icon: 'text-red-600',
        hover: 'hover:border-red-300 hover:shadow-md'
      },
      blue: {
        bg: 'bg-white border-gray-200',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-300 hover:shadow-md'
      }
    };
    return colors[color];
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'registration':
        return <IncidentRegistration />;
      case 'deviations':
        return <Deviations />;
      case 'followup':
        return <FollowUp />;
      default:
        return null;
    }
  };

  if (selectedSection) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedSection(null)}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Tilbake til oversikt
        </button>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-600 to-red-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Hendelser</h1>
            <p className="text-orange-50 mt-1">System for hendelser, avvik og oppfølging</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const colors = getColorClasses(section.color);

          return (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`${colors.bg} ${colors.hover} border-2 rounded-xl p-6 text-left transition-all group`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 text-base">
                    {section.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {section.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
