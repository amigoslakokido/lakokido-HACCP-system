import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { FileText, Plus, Save, Edit2, Trash2 } from 'lucide-react';

export function GreaseTrapManagement() {
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    emptying_date: new Date().toISOString().split('T')[0],
    next_emptying_date: '',
    company_name: 'NORVA',
    contact_person: '',
    report_pdf_url: '',
    notes: ''
  });

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    const { data } = await supabase.from('hms_environment_grease_trap').select('*').order('emptying_date', { ascending: false });
    if (data) setRecords(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('hms_environment_grease_trap').update(formData).eq('id', editingId);
    } else {
      await supabase.from('hms_environment_grease_trap').insert([formData]);
    }
    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('hms_environment_grease_trap').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: any) => {
    setFormData({
      emptying_date: record.emptying_date,
      next_emptying_date: record.next_emptying_date || '',
      company_name: record.company_name,
      contact_person: record.contact_person,
      report_pdf_url: record.report_pdf_url,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ emptying_date: new Date().toISOString().split('T')[0], next_emptying_date: '', company_name: 'NORVA', contact_person: '', report_pdf_url: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" /> Fettutskiller / NORVA
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Ny tømming
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dato for tømming *</label>
                <input type="date" required value={formData.emptying_date} onChange={(e) => setFormData({ ...formData, emptying_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Neste tømming</label>
                <input type="date" value={formData.next_emptying_date} onChange={(e) => setFormData({ ...formData, next_emptying_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktperson</label>
                <input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF-rapport URL</label>
              <input type="text" value={formData.report_pdf_url} onChange={(e) => setFormData({ ...formData, report_pdf_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Last opp eller legg inn lenke til rapport" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notater</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tømming</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rapport</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{new Date(record.emptying_date).toLocaleDateString('nb-NO')}</td>
                <td className="px-6 py-4 text-sm">{record.next_emptying_date ? new Date(record.next_emptying_date).toLocaleDateString('nb-NO') : '-'}</td>
                <td className="px-6 py-4 text-sm">{record.company_name}</td>
                <td className="px-6 py-4 text-sm">{record.report_pdf_url ? <a href={record.report_pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Se rapport</a> : '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && <div className="p-8 text-center text-gray-500">Ingen tømminger registrert</div>}
      </div>
    </div>
  );
}
