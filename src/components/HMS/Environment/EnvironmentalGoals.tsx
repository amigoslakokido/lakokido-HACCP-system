import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Target, Plus, Save, Edit2, Trash2 } from 'lucide-react';

export function EnvironmentalGoals() {
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    goal_title: '',
    goal_description: '',
    target_date: '',
    status: 'in_progress',
    progress_percentage: 0,
    responsible_person: '',
    achievements: '',
    challenges: '',
    notes: ''
  });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    const { data } = await supabase.from('hms_environment_goals').select('*').order('target_date', { ascending: true });
    if (data) setRecords(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('hms_environment_goals').update(formData).eq('id', editingId);
    } else {
      await supabase.from('hms_environment_goals').insert([formData]);
    }
    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_environment_goals').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: any) => {
    setFormData({
      goal_title: record.goal_title,
      goal_description: record.goal_description,
      target_date: record.target_date || '',
      status: record.status,
      progress_percentage: record.progress_percentage,
      responsible_person: record.responsible_person,
      achievements: record.achievements,
      challenges: record.challenges,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ goal_title: '', goal_description: '', target_date: '', status: 'in_progress', progress_percentage: 0, responsible_person: '', achievements: '', challenges: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="text-lime-600" /> Miljømål
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700">
          <Plus className="w-4 h-4" /> Nytt mål
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Måltittel *</label>
              <input type="text" required value={formData.goal_title} onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Navn på miljømålet" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse *</label>
              <textarea required value={formData.goal_description} onChange={(e) => setFormData({ ...formData, goal_description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Beskriv miljømålet og hvordan det skal oppnås..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Måldato</label>
                <input type="date" value={formData.target_date} onChange={(e) => setFormData({ ...formData, target_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="planned">Planlagt</option>
                  <option value="in_progress">Pågår</option>
                  <option value="completed">Fullført</option>
                  <option value="on_hold">På vent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fremdrift (%)</label>
                <input type="number" min="0" max="100" value={formData.progress_percentage} onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ansvarlig</label>
              <input type="text" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resultater oppnådd</label>
              <textarea value={formData.achievements} onChange={(e) => setFormData({ ...formData, achievements: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Hva har blitt oppnådd så langt..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utfordringer</label>
              <textarea value={formData.challenges} onChange={(e) => setFormData({ ...formData, challenges: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Utfordringer eller hindringer..." />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Save className="w-4 h-4" /> Lagre
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Avbryt</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{record.goal_title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    record.status === 'completed' ? 'bg-green-100 text-green-800' :
                    record.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    record.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status === 'planned' ? 'Planlagt' :
                     record.status === 'in_progress' ? 'Pågår' :
                     record.status === 'completed' ? 'Fullført' : 'På vent'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{record.goal_description}</p>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Fremdrift</span>
                    <span>{record.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-lime-600 h-2 rounded-full" style={{ width: `${record.progress_percentage}%` }}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {record.target_date && <p><span className="font-medium">Måldato:</span> {new Date(record.target_date).toLocaleDateString('nb-NO')}</p>}
                  {record.responsible_person && <p><span className="font-medium">Ansvarlig:</span> {record.responsible_person}</p>}
                  {record.achievements && <p><span className="font-medium">Resultater:</span> {record.achievements}</p>}
                  {record.challenges && <p><span className="font-medium">Utfordringer:</span> {record.challenges}</p>}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Ingen miljømål registrert</div>}
      </div>
    </div>
  );
}
