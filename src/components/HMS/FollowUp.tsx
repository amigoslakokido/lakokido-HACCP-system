import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ClipboardCheck, Plus, Save, Edit2, Trash2 } from 'lucide-react';

interface FollowUp {
  id: string;
  followup_type: string;
  root_cause_analysis: string;
  contributing_factors: string;
  corrective_actions: any[];
  preventive_actions: any[];
  responsible_person: string;
  deadline: string | null;
  status: string;
  completion_date: string | null;
  confirmed_by: string;
  confirmation_role: string;
}

export function FollowUp() {
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    followup_type: 'incident',
    root_cause_analysis: '',
    contributing_factors: '',
    corrective_action: '',
    preventive_action: '',
    responsible_person: '',
    deadline: '',
    status: 'in_progress',
    notes: ''
  });

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hms_followup')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setFollowups(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      corrective_actions: formData.corrective_action ? [formData.corrective_action] : [],
      preventive_actions: formData.preventive_action ? [formData.preventive_action] : []
    };

    if (editingId) {
      await supabase
        .from('hms_followup')
        .update(dataToSave)
        .eq('id', editingId);
    } else {
      await supabase
        .from('hms_followup')
        .insert([dataToSave]);
    }

    resetForm();
    loadFollowups();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_followup').delete().eq('id', id);
    loadFollowups();
  };

  const handleEdit = (followup: FollowUp) => {
    setFormData({
      followup_type: followup.followup_type,
      root_cause_analysis: followup.root_cause_analysis,
      contributing_factors: followup.contributing_factors,
      corrective_action: Array.isArray(followup.corrective_actions) ? followup.corrective_actions[0] || '' : '',
      preventive_action: Array.isArray(followup.preventive_actions) ? followup.preventive_actions[0] || '' : '',
      responsible_person: followup.responsible_person,
      deadline: followup.deadline || '',
      status: followup.status,
      notes: ''
    });
    setEditingId(followup.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      followup_type: 'incident',
      root_cause_analysis: '',
      contributing_factors: '',
      corrective_action: '',
      preventive_action: '',
      responsible_person: '',
      deadline: '',
      status: 'in_progress',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="text-center py-8">Laster...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" />
            Oppfølging
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Rotårsaksanalyse, korrigerende og forebyggende tiltak
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ny oppfølging
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Rediger oppfølging' : 'Ny oppfølging'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.followup_type}
                onChange={(e) => setFormData({ ...formData, followup_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="incident">Hendelse</option>
                <option value="deviation">Avvik</option>
                <option value="both">Begge</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rotårsaksanalyse *</label>
              <textarea
                required
                value={formData.root_cause_analysis}
                onChange={(e) => setFormData({ ...formData, root_cause_analysis: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Hva er grunnårsaken til hendelsen/avviket?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bidragende faktorer</label>
              <textarea
                value={formData.contributing_factors}
                onChange={(e) => setFormData({ ...formData, contributing_factors: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Andre faktorer som bidro til situasjonen..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Korrigerende tiltak</label>
              <textarea
                value={formData.corrective_action}
                onChange={(e) => setFormData({ ...formData, corrective_action: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Tiltak for å rette opp situasjonen..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forebyggende tiltak</label>
              <textarea
                value={formData.preventive_action}
                onChange={(e) => setFormData({ ...formData, preventive_action: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Tiltak for å forhindre lignende situasjoner i fremtiden..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ansvarlig *</label>
                <input
                  type="text"
                  required
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
                  <option value="in_progress">Pågår</option>
                  <option value="completed">Fullført</option>
                  <option value="verified">Verifisert</option>
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

      <div className="grid gap-4">
        {followups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Ingen oppfølginger registrert
          </div>
        ) : (
          followups.map((followup) => (
            <div key={followup.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    followup.status === 'verified' ? 'bg-green-100 text-green-800' :
                    followup.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {followup.status === 'in_progress' ? 'Pågår' :
                     followup.status === 'completed' ? 'Fullført' : 'Verifisert'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {followup.followup_type === 'incident' ? 'Hendelse' :
                     followup.followup_type === 'deviation' ? 'Avvik' : 'Begge'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(followup)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(followup.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Rotårsaksanalyse</h4>
                  <p className="text-sm text-gray-700">{followup.root_cause_analysis}</p>
                </div>

                {followup.contributing_factors && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Bidragende faktorer</h4>
                    <p className="text-sm text-gray-700">{followup.contributing_factors}</p>
                  </div>
                )}

                {Array.isArray(followup.corrective_actions) && followup.corrective_actions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Korrigerende tiltak</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {followup.corrective_actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(followup.preventive_actions) && followup.preventive_actions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Forebyggende tiltak</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {followup.preventive_actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 text-sm text-gray-600 pt-2 border-t">
                  <div>Ansvarlig: <span className="font-medium">{followup.responsible_person}</span></div>
                  {followup.deadline && (
                    <div>Frist: <span className="font-medium">{new Date(followup.deadline).toLocaleDateString('nb-NO')}</span></div>
                  )}
                  {followup.confirmed_by && (
                    <div>Bekreftet av: <span className="font-medium">{followup.confirmed_by}</span></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
