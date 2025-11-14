import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Plus, Save, Edit2, Trash2 } from 'lucide-react';

interface SafetyRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  equipment_name: string;
  equipment_type: string;
  training_date: string;
  trainer_name: string;
  status: string;
  completion_date: string | null;
  documentation_url: string;
  notes: string;
}

export function SafetyTraining() {
  const [records, setRecords] = useState<SafetyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    equipment_name: '',
    equipment_type: '',
    training_date: new Date().toISOString().split('T')[0],
    trainer_name: '',
    status: 'in_progress',
    completion_date: '',
    documentation_url: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('training_safety_equipment')
      .select('*')
      .order('training_date', { ascending: false });

    if (data) setRecords(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('training_safety_equipment')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('training_safety_equipment')
        .insert([formData]);
    }

    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('training_safety_equipment').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: SafetyRecord) => {
    setFormData({
      employee_name: record.employee_name,
      employee_id: record.employee_id,
      equipment_name: record.equipment_name,
      equipment_type: record.equipment_type,
      training_date: record.training_date,
      trainer_name: record.trainer_name,
      status: record.status,
      completion_date: record.completion_date || '',
      documentation_url: record.documentation_url,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employee_name: '',
      employee_id: '',
      equipment_name: '',
      equipment_type: '',
      training_date: new Date().toISOString().split('T')[0],
      trainer_name: '',
      status: 'in_progress',
      completion_date: '',
      documentation_url: '',
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
            <AlertCircle className="text-yellow-600" />
            Sikkerhetsopplæring
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Opplæring på maskiner og kjøkkenutstyr
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          <Plus className="w-4 h-4" />
          Ny opplæring
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Navn på ansatt *"
                value={formData.employee_name}
                onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Ansatt ID"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Utstyr/Maskin *"
                value={formData.equipment_name}
                onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <select
                value={formData.equipment_type}
                onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">Velg type</option>
                <option value="fryer">Frityrkoker</option>
                <option value="oven">Ovn/Stekeovn</option>
                <option value="slicer">Skjæremaskin</option>
                <option value="dishwasher">Oppvaskmaskin</option>
                <option value="mixer">Mikser</option>
                <option value="other">Annet</option>
              </select>
              <input
                type="date"
                required
                value={formData.training_date}
                onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Navn på instruktør"
                value={formData.trainer_name}
                onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="in_progress">Under opplæring</option>
                <option value="completed">Fullført</option>
                <option value="needs_refresh">Trenger oppfriskning</option>
              </select>
              <input
                type="date"
                placeholder="Fullføringsdato"
                value={formData.completion_date}
                onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Dokumentasjon URL"
                value={formData.documentation_url}
                onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                className="px-3 py-2 border rounded-lg col-span-2"
              />
            </div>
            <textarea
              placeholder="Notater"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Save className="w-4 h-4 inline mr-2" />
                Lagre
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg">
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ansatt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utstyr</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 text-sm">{record.employee_name}</td>
                <td className="px-6 py-4 text-sm">{record.equipment_name}</td>
                <td className="px-6 py-4 text-sm">{new Date(record.training_date).toLocaleDateString('nb-NO')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    record.status === 'completed' ? 'bg-green-100 text-green-800' :
                    record.status === 'needs_refresh' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {record.status === 'completed' ? 'Fullført' :
                     record.status === 'needs_refresh' ? 'Trenger oppfriskning' : 'Under opplæring'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(record)} className="text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
