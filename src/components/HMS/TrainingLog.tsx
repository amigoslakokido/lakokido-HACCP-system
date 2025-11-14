import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Search, Filter } from 'lucide-react';

interface TrainingLogEntry {
  id: string;
  employee_name: string;
  employee_id: string;
  training_type: string;
  training_name: string;
  training_date: string;
  completion_date: string | null;
  status: string;
  documentation_url: string;
  notes: string;
}

export function TrainingLog() {
  const [entries, setEntries] = useState<TrainingLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('training_log')
      .select('*')
      .order('training_date', { ascending: false });

    if (data) setEntries(data);
    setLoading(false);
  };

  const getTrainingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      management: 'HMS Ledelse',
      fire_safety: 'Brannvern',
      first_aid: 'Førstehjelp',
      routine: 'Rutine',
      safety_equipment: 'Sikkerhet',
      new_employee: 'Nyansatt',
      other: 'Annet'
    };
    return labels[type] || type;
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.training_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.training_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedByEmployee = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.employee_name]) {
      acc[entry.employee_name] = [];
    }
    acc[entry.employee_name].push(entry);
    return acc;
  }, {} as Record<string, TrainingLogEntry[]>);

  if (loading) return <div className="text-center py-8">Laster...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" />
          Opplæringslogg
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Full oversikt per ansatt med datoer, kurs og dokumentasjon
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Søk etter ansatt eller kurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none"
            >
              <option value="all">Alle typer</option>
              <option value="management">HMS Ledelse</option>
              <option value="fire_safety">Brannvern</option>
              <option value="first_aid">Førstehjelp</option>
              <option value="routine">Rutine</option>
              <option value="safety_equipment">Sikkerhet</option>
              <option value="new_employee">Nyansatt</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedByEmployee).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Ingen opplæringsdata funnet
          </div>
        ) : (
          Object.entries(groupedByEmployee).map(([employeeName, employeeEntries]) => (
            <div key={employeeName} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900">{employeeName}</h3>
                <p className="text-sm text-blue-700">
                  {employeeEntries.length} opplæring{employeeEntries.length !== 1 ? 'er' : ''}
                  {employeeEntries[0].employee_id && ` • ID: ${employeeEntries[0].employee_id}`}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kurs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dok.</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employeeEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {getTrainingTypeLabel(entry.training_type)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.training_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(entry.training_date).toLocaleDateString('nb-NO')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                            entry.status === 'expired' ? 'bg-red-100 text-red-800' :
                            entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.status === 'completed' ? 'Fullført' :
                             entry.status === 'expired' ? 'Utløpt' :
                             entry.status === 'pending' ? 'Venter' : 'Pågående'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {entry.documentation_url && (
                            <a
                              href={entry.documentation_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Se dok.
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
