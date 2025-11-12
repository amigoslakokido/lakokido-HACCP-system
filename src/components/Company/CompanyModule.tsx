import { useState } from 'react';
import { CompanyInfo } from './CompanyInfo';
import { EmployeesManagement } from './EmployeesManagement';
import { DocumentsManager } from './DocumentsManager';
import { Building2, Users, FileText, QrCode } from 'lucide-react';

export function CompanyModule() {
  const [activeTab, setActiveTab] = useState<'info' | 'employees' | 'documents' | 'qr'>('info');

  const tabs = [
    { id: 'info' as const, label: 'معلومات الشركة', label_no: 'Firmainfo', icon: Building2 },
    { id: 'employees' as const, label: 'الموظفين', label_no: 'Ansatte', icon: Users },
    { id: 'documents' as const, label: 'المستندات', label_no: 'Dokumenter', icon: FileText },
    { id: 'qr' as const, label: 'QR رفع', label_no: 'QR Upload', icon: QrCode }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <CompanyInfo />;
      case 'employees':
        return <EmployeesManagement />;
      case 'documents':
        return <DocumentsManager />;
      case 'qr':
        return (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">QR-kode for opplasting</h3>
            <p className="text-slate-500 mb-6">رمز QR للرفع من الموبايل - Kommer snart</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-slate-200 rounded-t-2xl overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm">{tab.label_no}</div>
                <div className="text-xs opacity-75">{tab.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6">
        {renderContent()}
      </div>
    </div>
  );
}
