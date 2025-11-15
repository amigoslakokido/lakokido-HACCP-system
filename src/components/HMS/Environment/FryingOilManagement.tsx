import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Droplet, Plus, Save, Edit2, Trash2 } from 'lucide-react';

export function FryingOilManagement() {
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    routine_description: '',
    supplier_name: '',
    supplier_contact: '',
    collection_frequency: '',
    last_collection_date: '',
    next_collection_date: '',
    notes: ''
  });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    const { data } = await supabase.from('hms_environment_frying_oil').select('*').order('created_at', { ascending: false });
    if (data) setRecords(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('hms_environment_frying_oil').update(formData).eq('id', editingId);
    } else {
      await supabase.from('hms_environment_frying_oil').insert([formData]);
    }
    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_environment_frying_oil').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: any) => {
    setFormData({
      routine_description: record.routine_description,
      supplier_name: record.supplier_name,
      supplier_contact: record.supplier_contact,
      collection_frequency: record.collection_frequency,
      last_collection_date: record.last_collection_date || '',
      next_collection_date: record.next_collection_date || '',
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ routine_description: '', supplier_name: '', supplier_contact: '', collection_frequency: '', last_collection_date: '', next_collection_date: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Droplet className="text-amber-600" /> Håndtering av frityrolje
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          <Plus className="w-4 h-4" /> Ny oppføring
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse av rutine</label>
              <textarea value={formData.routine_description} onChange={(e) => setFormData({ ...formData, routine_description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Beskriv rutinen for håndtering av frityrolje..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leverandør</label>
                <input type="text" value={formData.supplier_name} onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Navn på leverandør" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktinfo</label>
                <input type="text" value={formData.supplier_contact} onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Telefon eller e-post" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hentingsfrekvens</label>
                <input type="text" value={formData.collection_frequency} onChange={(e) => setFormData({ ...formData, collection_frequency: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="f.eks. hver 2. uke" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Siste henting</label>
                <input type="date" value={formData.last_collection_date} onChange={(e) => setFormData({ ...formData, last_collection_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Neste henting</label>
                <input type="date" value={formData.next_collection_date} onChange={(e) => setFormData({ ...formData, next_collection_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notater</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Ekstra informasjon..." />
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

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {record.routine_description && <p className="text-gray-700 mb-3">{record.routine_description}</p>}
                <div className="text-sm text-gray-600 space-y-1">
                  {record.supplier_name && <p><span className="font-medium">Leverandør:</span> {record.supplier_name}</p>}
                  {record.supplier_contact && <p><span className="font-medium">Kontakt:</span> {record.supplier_contact}</p>}
                  {record.collection_frequency && <p><span className="font-medium">Frekvens:</span> {record.collection_frequency}</p>}
                  {record.last_collection_date && <p><span className="font-medium">Siste henting:</span> {new Date(record.last_collection_date).toLocaleDateString('nb-NO')}</p>}
                  {record.next_collection_date && <p><span className="font-medium">Neste henting:</span> {new Date(record.next_collection_date).toLocaleDateString('nb-NO')}</p>}
                  {record.notes && <p className="text-gray-500 italic mt-2">{record.notes}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Ingen oppføringer ennå. Klikk på "Ny oppføring" for å legge til informasjon om håndtering av frityrolje.
          </div>
        )}
      </div>
    </div>
  );
}
