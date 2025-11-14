import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckSquare, Plus, Save, Edit2, Trash2, PenTool } from 'lucide-react';

interface RoutineItem {
  id: string;
  category: string;
  item_text: string;
  description: string;
  is_active: boolean;
}

interface RoutineRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  training_date: string;
  category: string;
  completed_items: any[];
  employee_signature: string;
  employee_signed_at: string | null;
  manager_signature: string;
  manager_signed_at: string | null;
  manager_name: string;
  status: string;
  notes: string;
}

export function RoutineTraining() {
  const [records, setRecords] = useState<RoutineRecord[]>([]);
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    training_date: new Date().toISOString().split('T')[0],
    category: 'all' as string,
    completed_items: [] as string[],
    employee_signature: '',
    manager_signature: '',
    manager_name: '',
    notes: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadRecords(), loadItems()]);
    setLoading(false);
  };

  const loadRecords = async () => {
    const { data } = await supabase
      .from('training_routine')
      .select('*')
      .order('training_date', { ascending: false });

    if (data) setRecords(data);
  };

  const loadItems = async () => {
    const { data } = await supabase
      .from('training_routine_items')
      .select('*')
      .eq('is_active', true)
      .order('category, display_order');

    if (data) setItems(data);
  };

  const getFilteredItems = () => {
    if (formData.category === 'all') return items;
    return items.filter(item => item.category === formData.category);
  };

  const handleItemToggle = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      completed_items: prev.completed_items.includes(itemId)
        ? prev.completed_items.filter(id => id !== itemId)
        : [...prev.completed_items, itemId]
    }));
  };

  const handleEmployeeSign = () => {
    const name = prompt('Skriv inn ditt navn for å signere:');
    if (name) {
      setFormData(prev => ({
        ...prev,
        employee_signature: name
      }));
    }
  };

  const handleManagerSign = () => {
    const name = prompt('Skriv inn lederens navn for å signere:');
    if (name) {
      setFormData(prev => ({
        ...prev,
        manager_signature: name,
        manager_name: name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const status =
      formData.employee_signature && formData.manager_signature ? 'completed' :
      formData.employee_signature ? 'pending_manager_signature' :
      'in_progress';

    const dataToSave = {
      ...formData,
      completed_items: JSON.stringify(formData.completed_items),
      employee_signed_at: formData.employee_signature ? new Date().toISOString() : null,
      manager_signed_at: formData.manager_signature ? new Date().toISOString() : null,
      status
    };

    if (editingId) {
      await supabase
        .from('training_routine')
        .update(dataToSave)
        .eq('id', editingId);
    } else {
      await supabase
        .from('training_routine')
        .insert([dataToSave]);
    }

    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne registreringen?')) return;
    await supabase.from('training_routine').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: RoutineRecord) => {
    setFormData({
      employee_name: record.employee_name,
      employee_id: record.employee_id,
      training_date: record.training_date,
      category: record.category,
      completed_items: Array.isArray(record.completed_items) ? record.completed_items : [],
      employee_signature: record.employee_signature,
      manager_signature: record.manager_signature,
      manager_name: record.manager_name,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employee_name: '',
      employee_id: '',
      training_date: new Date().toISOString().split('T')[0],
      category: 'all',
      completed_items: [],
      employee_signature: '',
      manager_signature: '',
      manager_name: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      washing: 'Vask',
      hygiene: 'Hygiene',
      equipment: 'Utstyr',
      safety: 'Sikkerhet',
      all: 'Alle kategorier'
    };
    return labels[category] || category;
  };

  if (loading) return <div className="text-center py-8">Laster...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="text-green-600" />
            Rutineopplæring
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Opplæring i vask, hygiene, bruk av utstyr og sikkerhet
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Ny opplæring
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Rediger opplæring' : 'Ny rutineopplæring'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Navn på ansatt *
                </label>
                <input
                  type="text"
                  required
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ansatt ID
                </label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dato *
                </label>
                <input
                  type="date"
                  required
                  value={formData.training_date}
                  onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Alle kategorier</option>
                  <option value="washing">Vask</option>
                  <option value="hygiene">Hygiene</option>
                  <option value="equipment">Utstyr</option>
                  <option value="safety">Sikkerhet</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Sjekkliste</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                {getFilteredItems().map((item) => (
                  <label key={item.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.completed_items.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.item_text}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Kategori: {getCategoryLabel(item.category)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notater
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Signatur medarbeider
                </label>
                {formData.employee_signature ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {formData.employee_signature}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleEmployeeSign}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Signer som medarbeider
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Signatur leder
                </label>
                {formData.manager_signature ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {formData.manager_signature}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleManagerSign}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Signer som leder
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ansatt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fullført</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Ingen registreringer funnet
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const completedCount = Array.isArray(record.completed_items) ? record.completed_items.length : 0;
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{record.employee_name}</div>
                        {record.employee_id && (
                          <div className="text-sm text-gray-500">ID: {record.employee_id}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(record.training_date).toLocaleDateString('nb-NO')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getCategoryLabel(record.category)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {completedCount} punkter
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.status === 'completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'pending_manager_signature' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status === 'completed' ? 'Fullført' :
                           record.status === 'pending_manager_signature' ? 'Venter på leder' :
                           'Pågående'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
