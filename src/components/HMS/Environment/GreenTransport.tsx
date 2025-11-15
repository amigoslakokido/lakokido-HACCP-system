import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Car, Plus, Save, Edit2, Trash2 } from 'lucide-react';

export function GreenTransport() {
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    has_electric_vehicles: false,
    vehicle_description: '',
    charging_infrastructure: '',
    future_plans: '',
    implementation_timeline: '',
    cost_savings: '',
    notes: ''
  });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    const { data } = await supabase.from('hms_environment_green_transport').select('*').order('created_at', { ascending: false });
    if (data) setRecords(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('hms_environment_green_transport').update(formData).eq('id', editingId);
    } else {
      await supabase.from('hms_environment_green_transport').insert([formData]);
    }
    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_environment_green_transport').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: any) => {
    setFormData({
      has_electric_vehicles: record.has_electric_vehicles,
      vehicle_description: record.vehicle_description,
      charging_infrastructure: record.charging_infrastructure,
      future_plans: record.future_plans,
      implementation_timeline: record.implementation_timeline,
      cost_savings: record.cost_savings,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ has_electric_vehicles: false, vehicle_description: '', charging_infrastructure: '', future_plans: '', implementation_timeline: '', cost_savings: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Car className="text-emerald-600" /> Grønn transport
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <Plus className="w-4 h-4" /> Ny oppføring
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.has_electric_vehicles} onChange={(e) => setFormData({ ...formData, has_electric_vehicles: e.target.checked })} />
                <span className="text-sm font-medium text-gray-700">Vi har elektriske kjøretøy</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse av kjøretøy</label>
              <textarea value={formData.vehicle_description} onChange={(e) => setFormData({ ...formData, vehicle_description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Type, antall, bruksområde..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ladeinfrastruktur</label>
              <textarea value={formData.charging_infrastructure} onChange={(e) => setFormData({ ...formData, charging_infrastructure: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Ladepunkter, type lader..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fremtidige planer</label>
              <textarea value={formData.future_plans} onChange={(e) => setFormData({ ...formData, future_plans: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Planer for økt bruk av elektriske kjøretøy..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tidsplan for implementering</label>
              <input type="text" value={formData.implementation_timeline} onChange={(e) => setFormData({ ...formData, implementation_timeline: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="f.eks. 2025-2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kostnadsbesparelser</label>
              <textarea value={formData.cost_savings} onChange={(e) => setFormData({ ...formData, cost_savings: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Estimerte besparelser på drivstoff, vedlikehold..." />
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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {record.has_electric_vehicles ? 'Vi har elektriske kjøretøy' : 'Ingen elektriske kjøretøy ennå'}
                </h3>
                {record.has_electric_vehicles && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Aktiv</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              {record.vehicle_description && <p><span className="font-medium">Kjøretøy:</span> {record.vehicle_description}</p>}
              {record.charging_infrastructure && <p><span className="font-medium">Lading:</span> {record.charging_infrastructure}</p>}
              {record.future_plans && <p><span className="font-medium">Fremtidige planer:</span> {record.future_plans}</p>}
              {record.implementation_timeline && <p><span className="font-medium">Tidsplan:</span> {record.implementation_timeline}</p>}
              {record.cost_savings && <p><span className="font-medium">Besparelser:</span> {record.cost_savings}</p>}
            </div>
          </div>
        ))}
        {records.length === 0 && <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Ingen oppføringer ennå</div>}
      </div>
    </div>
  );
}
