import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Plus, Save, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { SmartInput } from './SmartInput';

interface Deviation {
  id: string;
  deviation_type: string;
  title: string;
  description: string;
  identified_date: string;
  identified_by: string;
  location: string;
  risk_level: string;
  responsible_person: string;
  deadline: string | null;
  status: string;
  resolution_description: string;
  resolved_date: string | null;
  resolved_by: string;
}

export function Deviations() {
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    deviation_type: 'safety',
    title: '',
    description: '',
    identified_date: new Date().toISOString().split('T')[0],
    identified_by: '',
    location: '',
    risk_level: 'low',
    responsible_person: '',
    deadline: '',
    status: 'open',
    resolution_description: '',
    notes: ''
  });

  useEffect(() => {
    loadDeviations();
  }, []);

  const loadDeviations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hms_deviations')
      .select('*')
      .order('identified_date', { ascending: false });

    if (data) setDeviations(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('hms_deviations')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('hms_deviations')
        .insert([formData]);
    }

    resetForm();
    loadDeviations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_deviations').delete().eq('id', id);
    loadDeviations();
  };

  const handleEdit = (deviation: Deviation) => {
    setFormData({
      deviation_type: deviation.deviation_type,
      title: deviation.title,
      description: deviation.description,
      identified_date: deviation.identified_date,
      identified_by: deviation.identified_by,
      location: deviation.location,
      risk_level: deviation.risk_level,
      responsible_person: deviation.responsible_person,
      deadline: deviation.deadline || '',
      status: deviation.status,
      resolution_description: deviation.resolution_description,
      notes: ''
    });
    setEditingId(deviation.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      deviation_type: 'safety',
      title: '',
      description: '',
      identified_date: new Date().toISOString().split('T')[0],
      identified_by: '',
      location: '',
      risk_level: 'low',
      responsible_person: '',
      deadline: '',
      status: 'open',
      resolution_description: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getDeviationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      safety: 'Sikkerhet',
      work_environment: 'Arbeidsmiljø',
      fire: 'Brann',
      equipment: 'Utstyr',
      routines: 'Rutiner',
      other: 'Annet'
    };
    return labels[type] || type;
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[risk] || colors.low;
  };

  if (loading) return <div className="text-center py-8">Laster...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="text-red-600" />
            Avvik
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Håndtering av avvik innen sikkerhet, arbeidsmiljø, brann, utstyr og rutiner
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          Nytt avvik
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Rediger avvik' : 'Registrer nytt avvik'}
          </h3>

          {!editingId && (
            <div className="mb-6">
              <SmartInput
                section="deviation"
                onAnalysisComplete={(analysis) => {
                  if (analysis.autoFillData) {
                    setFormData({
                      ...formData,
                      deviation_type: analysis.autoFillData.deviation_type === 'Førstehjelp' ? 'safety' :
                                    analysis.autoFillData.deviation_type === 'Brannsikkerhet' ? 'fire' :
                                    analysis.autoFillData.deviation_type === 'Utstyr/Vedlikehold' ? 'equipment' :
                                    analysis.autoFillData.deviation_type === 'Hygiene/Renhold' ? 'routines' :
                                    'other',
                      description: analysis.autoFillData.description,
                      risk_level: analysis.autoFillData.severity === 'Høy' ? 'high' :
                                 analysis.autoFillData.severity === 'Middels' ? 'medium' :
                                 analysis.autoFillData.severity === 'Kritisk' ? 'critical' : 'low',
                      status: analysis.autoFillData.status === 'Åpen' ? 'open' : 'open'
                    });
                  }
                }}
                placeholder="Eksempel: Førstehjelpsskap mangler plaster og bandasjer"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type avvik *</label>
                <select
                  required
                  value={formData.deviation_type}
                  onChange={(e) => setFormData({ ...formData, deviation_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="safety">Sikkerhet</option>
                  <option value="work_environment">Arbeidsmiljø</option>
                  <option value="fire">Brann</option>
                  <option value="equipment">Utstyr</option>
                  <option value="routines">Rutiner</option>
                  <option value="other">Annet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risikonivå</label>
                <select
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Lav</option>
                  <option value="medium">Middels</option>
                  <option value="high">Høy</option>
                  <option value="critical">Kritisk</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tittel *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identifisert dato *</label>
                <input
                  type="date"
                  required
                  value={formData.identified_date}
                  onChange={(e) => setFormData({ ...formData, identified_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identifisert av *</label>
                <input
                  type="text"
                  required
                  value={formData.identified_by}
                  onChange={(e) => setFormData({ ...formData, identified_by: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sted</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ansvarlig</label>
                <input
                  type="text"
                  value={formData.responsible_person}
                  onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frist</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="open">Åpen</option>
                  <option value="in_progress">Under arbeid</option>
                  <option value="closed">Lukket</option>
                </select>
              </div>
            </div>

            {formData.status !== 'open' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Løsningsbeskrivelse</label>
                <textarea
                  value={formData.resolution_description}
                  onChange={(e) => setFormData({ ...formData, resolution_description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Lagre
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tittel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risiko</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ansvarlig</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frist</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deviations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Ingen avvik registrert
                </td>
              </tr>
            ) : (
              deviations.map((deviation) => (
                <tr key={deviation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{getDeviationTypeLabel(deviation.deviation_type)}</td>
                  <td className="px-6 py-4 text-sm font-medium">{deviation.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(deviation.risk_level)}`}>
                      {deviation.risk_level === 'low' ? 'Lav' :
                       deviation.risk_level === 'medium' ? 'Middels' :
                       deviation.risk_level === 'high' ? 'Høy' : 'Kritisk'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{deviation.responsible_person || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    {deviation.deadline ? new Date(deviation.deadline).toLocaleDateString('nb-NO') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      deviation.status === 'closed' ? 'bg-green-100 text-green-800' :
                      deviation.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deviation.status === 'open' ? 'Åpen' :
                       deviation.status === 'in_progress' ? 'Under arbeid' : 'Lukket'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(deviation)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(deviation.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
