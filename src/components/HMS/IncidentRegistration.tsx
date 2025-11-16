import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Plus, Save, Edit2, Trash2, Image, FileText } from 'lucide-react';
import { SmartInput } from './SmartInput';

interface Incident {
  id: string;
  incident_date: string;
  incident_time: string;
  location: string;
  incident_type: string;
  severity: string;
  description: string;
  involved_person: string;
  witness_names: string;
  notification_sent: boolean;
  notification_to: string;
  images: any[];
  documents: any[];
  reported_by: string;
  status: string;
  immediate_actions: string;
}

export function IncidentRegistration() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    incident_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    location: '',
    incident_type: 'near_miss',
    severity: 'low',
    description: '',
    involved_person: '',
    involved_person_id: '',
    witness_names: '',
    notification_sent: false,
    notification_to: '',
    immediate_actions: '',
    reported_by: '',
    status: 'open',
    notes: ''
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hms_incident_registry')
      .select('*')
      .order('incident_date', { ascending: false });

    if (data) setIncidents(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('hms_incident_registry')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('hms_incident_registry')
        .insert([formData]);
    }

    resetForm();
    loadIncidents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne hendelsen?')) return;
    await supabase.from('hms_incident_registry').delete().eq('id', id);
    loadIncidents();
  };

  const handleEdit = (incident: Incident) => {
    setFormData({
      incident_date: incident.incident_date,
      incident_time: incident.incident_time,
      location: incident.location,
      incident_type: incident.incident_type,
      severity: incident.severity,
      description: incident.description,
      involved_person: incident.involved_person,
      involved_person_id: '',
      witness_names: incident.witness_names,
      notification_sent: incident.notification_sent,
      notification_to: incident.notification_to,
      immediate_actions: incident.immediate_actions,
      reported_by: incident.reported_by,
      status: incident.status,
      notes: ''
    });
    setEditingId(incident.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      incident_date: new Date().toISOString().split('T')[0],
      incident_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      location: '',
      incident_type: 'near_miss',
      severity: 'low',
      description: '',
      involved_person: '',
      involved_person_id: '',
      witness_names: '',
      notification_sent: false,
      notification_to: '',
      immediate_actions: '',
      reported_by: '',
      status: 'open',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getIncidentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      accident: 'Ulykke',
      personal_injury: 'Personskade',
      near_miss: 'Nestenulykke',
      material_damage: 'Materiell skade',
      other: 'Annet'
    };
    return labels[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.low;
  };

  if (loading) return <div className="text-center py-8">Laster...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-600" />
            Register Hendelser
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registrering av ulykker, personskader, nestenulykker og materiell skade
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Ny hendelse
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Rediger hendelse' : 'Registrer ny hendelse'}
          </h3>

          {!editingId && (
            <div className="mb-6">
              <SmartInput
                section="incident"
                onAnalysisComplete={(analysis) => {
                  if (analysis.autoFillData) {
                    setFormData({
                      ...formData,
                      incident_type: analysis.autoFillData.incident_type || formData.incident_type,
                      description: analysis.autoFillData.description,
                      severity: analysis.autoFillData.severity === 'Kritisk' ? 'critical' :
                               analysis.autoFillData.severity === 'Høy' ? 'high' :
                               analysis.autoFillData.severity === 'Middels' ? 'medium' : 'low',
                      status: analysis.autoFillData.status || formData.status
                    });
                  }
                }}
                placeholder="Eksempel: Ansatt kuttet seg på kniv i kjøkkenet"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label>
                <input
                  type="date"
                  required
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tid *</label>
                <input
                  type="time"
                  required
                  value={formData.incident_time}
                  onChange={(e) => setFormData({ ...formData, incident_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sted *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type hendelse *</label>
                <select
                  required
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="accident">Ulykke</option>
                  <option value="personal_injury">Personskade</option>
                  <option value="near_miss">Nestenulykke</option>
                  <option value="material_damage">Materiell skade</option>
                  <option value="other">Annet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alvorlighetsgrad</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Beskriv hendelsen i detalj..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Involvert person</label>
                <input
                  type="text"
                  value={formData.involved_person}
                  onChange={(e) => setFormData({ ...formData, involved_person: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vitner</label>
                <input
                  type="text"
                  value={formData.witness_names}
                  onChange={(e) => setFormData({ ...formData, witness_names: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Navn på vitner (kommaseparert)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Umiddelbare tiltak</label>
              <textarea
                value={formData.immediate_actions}
                onChange={(e) => setFormData({ ...formData, immediate_actions: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Hvilke tiltak ble iverksatt umiddelbart?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.notification_sent}
                    onChange={(e) => setFormData({ ...formData, notification_sent: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Varsling sendt</span>
                </label>
              </div>
              {formData.notification_sent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Varslet til</label>
                  <input
                    type="text"
                    value={formData.notification_to}
                    onChange={(e) => setFormData({ ...formData, notification_to: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rapportert av *</label>
                <input
                  type="text"
                  required
                  value={formData.reported_by}
                  onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
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
                  <option value="under_investigation">Under etterforskning</option>
                  <option value="completed">Fullført</option>
                  <option value="closed">Lukket</option>
                </select>
              </div>
            </div>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dato/Tid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alvorlighet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Ingen hendelser registrert
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div>{new Date(incident.incident_date).toLocaleDateString('nb-NO')}</div>
                    <div className="text-gray-500">{incident.incident_time}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{getIncidentTypeLabel(incident.incident_type)}</td>
                  <td className="px-6 py-4 text-sm">{incident.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(incident.severity)}`}>
                      {incident.severity === 'low' ? 'Lav' :
                       incident.severity === 'medium' ? 'Middels' :
                       incident.severity === 'high' ? 'Høy' : 'Kritisk'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      incident.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                      incident.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {incident.status === 'open' ? 'Åpen' :
                       incident.status === 'under_investigation' ? 'Etterforskning' :
                       incident.status === 'completed' ? 'Fullført' : 'Lukket'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(incident)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(incident.id)} className="text-red-600 hover:text-red-800">
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
