import { useState } from 'react';
import { GraduationCap, Flame, Shield, CheckSquare, AlertCircle, FileText, Users } from 'lucide-react';
import { ManagementTraining } from './ManagementTraining';
import { FireSafetyTraining } from './FireSafetyTraining';
import { FirstAidTraining } from './FirstAidTraining';
import { RoutineTraining } from './RoutineTraining';
import { SafetyTraining } from './SafetyTraining';
import { TrainingLog } from './TrainingLog';
import { NewEmployeeConfirmation } from './NewEmployeeConfirmation';

export function HMSTraining() {
  const [activeTab, setActiveTab] = useState('management');

  const tabs = [
    { id: 'management', name: 'HMS opplæring - Ledelse', icon: GraduationCap },
    { id: 'fire', name: 'Brannvernopplæring', icon: Flame },
    { id: 'first-aid', name: 'Førstehjelpsopplæring', icon: Shield },
    { id: 'routine', name: 'Rutineopplæring', icon: CheckSquare },
    { id: 'safety', name: 'Sikkerhetsopplæring', icon: AlertCircle },
    { id: 'log', name: 'Opplæringslogg', icon: FileText },
    { id: 'new-employee', name: 'Bekreftelse nyansatte', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
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
        return <ManagementTraining />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="text-blue-600" />
          HMS opplæring
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Komplett opplæringssystem for HMS, sikkerhet og rutiner
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
