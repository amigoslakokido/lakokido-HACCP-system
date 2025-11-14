import { useState } from 'react';
import { GraduationCap, Flame, Shield, CheckSquare, AlertCircle, FileText, Users, Target, ArrowLeft } from 'lucide-react';
import { ManagementTraining } from './ManagementTraining';
import { FireSafetyTraining } from './FireSafetyTraining';
import { FirstAidTraining } from './FirstAidTraining';
import { RoutineTraining } from './RoutineTraining';
import { SafetyTraining } from './SafetyTraining';
import { TrainingLog } from './TrainingLog';
import { NewEmployeeConfirmation } from './NewEmployeeConfirmation';

export function HMSTraining() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'management',
      name: 'HMS opplæring - Ledelse',
      description: 'Lovpålagt opplæring etter AML § 3-5',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'fire',
      name: 'Brannvernopplæring',
      description: 'Registrering av brannvernkurs',
      icon: Flame,
      color: 'orange'
    },
    {
      id: 'first-aid',
      name: 'Førstehjelpsopplæring',
      description: 'Førstehjelp og gyldighet',
      icon: Shield,
      color: 'red'
    },
    {
      id: 'routine',
      name: 'Rutineopplæring',
      description: 'Vask, hygiene, utstyr og sikkerhet',
      icon: CheckSquare,
      color: 'green'
    },
    {
      id: 'safety',
      name: 'Sikkerhetsopplæring',
      description: 'Opplæring på maskiner og utstyr',
      icon: AlertCircle,
      color: 'yellow'
    },
    {
      id: 'log',
      name: 'Opplæringslogg',
      description: 'Full oversikt per ansatt',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'new-employee',
      name: 'Bekreftelse nyansatte',
      description: 'Formular for nyansatte',
      icon: Users,
      color: 'purple'
    },
  ];

  const getColorClasses = (color: string, isSelected: boolean = false) => {
    const colors: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
      blue: {
        bg: isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200',
        icon: 'text-blue-600',
        border: 'border-blue-500',
        hover: 'hover:border-blue-300 hover:shadow-md'
      },
      orange: {
        bg: isSelected ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200',
        icon: 'text-orange-600',
        border: 'border-orange-500',
        hover: 'hover:border-orange-300 hover:shadow-md'
      },
      red: {
        bg: isSelected ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200',
        icon: 'text-red-600',
        border: 'border-red-500',
        hover: 'hover:border-red-300 hover:shadow-md'
      },
      green: {
        bg: isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200',
        icon: 'text-green-600',
        border: 'border-green-500',
        hover: 'hover:border-green-300 hover:shadow-md'
      },
      yellow: {
        bg: isSelected ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-gray-200',
        icon: 'text-yellow-600',
        border: 'border-yellow-500',
        hover: 'hover:border-yellow-300 hover:shadow-md'
      },
      purple: {
        bg: isSelected ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-200',
        icon: 'text-purple-600',
        border: 'border-purple-500',
        hover: 'hover:border-purple-300 hover:shadow-md'
      }
    };
    return colors[color];
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'management':
        return <ManagementTraining />;
      case 'fire':
        return <FireSafetyTraining />;
      case 'first-aid':
        return <FirstAidTraining />;
      case 'routine':
        return <RoutineTraining />;
      case 'safety':
        return <SafetyTraining />;
      case 'log':
        return <TrainingLog />;
      case 'new-employee':
        return <NewEmployeeConfirmation />;
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
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Opplæring</h1>
            <p className="text-blue-50 mt-1">Komplett opplæringssystem for HMS</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const colors = getColorClasses(section.color, false);

          return (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`${colors.bg} ${colors.hover} border-2 rounded-xl p-6 text-left transition-all group`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
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
