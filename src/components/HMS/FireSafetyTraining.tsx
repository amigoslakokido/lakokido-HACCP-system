import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Flame, Plus, Save, Edit2, Trash2, Upload, FileText, Calendar, User } from 'lucide-react';

interface FireSafetyRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  course_name: string;
  course_date: string;
  responsible_person: string;
  instructor: string;
  location: string;
  certificate_url: string;
  participant_list_url: string;
  notes: string;
  status: string;
  expiry_date: string | null;
  created_at: string;
}

export function FireSafetyTraining() {
  const [records, setRecords] = useState<FireSafetyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    course_name: 'Brannvernkurs',
    course_date: new Date().toISOString().split('T')[0],
    responsible_person: '',
    instructor: '',
    location: '',
    certificate_url: '',
    participant_list_url: '',
    notes: '',
    status: 'completed',
    expiry_date: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('training_fire_safety')
      .select('*')
      .order('course_date', { ascending: false });

    if (!error && data) setRecords(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('training_fire_safety')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('training_fire_safety')
        .insert([formData]);
    }

    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne registreringen?')) return;

    await supabase
      .from('training_fire_safety')
      .delete()
      .eq('id', id);

    loadRecords();
  };

  const handleEdit = (record: FireSafetyRecord) => {
    setFormData({
      employee_name: record.employee_name,
      employee_id: record.employee_id,
      course_name: record.course_name,
      course_date: record.course_date,
      responsible_person: record.responsible_person,
      instructor: record.instructor,
      location: record.location,
      certificate_url: record.certificate_url,
      participant_list_url: record.participant_list_url,
      notes: record.notes,
      status: record.status,
      expiry_date: record.expiry_date || ''
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employee_name: '',
      employee_id: '',
      course_name: 'Brannvernkurs',
      course_date: new Date().toISOString().split('T')[0],
      responsible_person: '',
      instructor: '',
      location: '',
      certificate_url: '',
      participant_list_url: '',
      notes: '',
      status: 'completed',
      expiry_date: ''
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
            <Flame className="text-orange-600" />
            Brannvernopplæring
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registrering av ansatte som har gjennomført brannvernkurs
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Ny registrering
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Rediger registrering' : 'Ny brannvernopplæring'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Kursnavn
                </label>
                <input
                  type="text"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
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
                  value={formData.course_date}
                  onChange={(e) => setFormData({ ...formData, course_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ansvarlig person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsible_person}
                  onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruktør
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sted
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="completed">Fullført</option>
                  <option value="in_progress">Pågående</option>
                  <option value="expired">Utløpt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utløpsdato (valgfritt)
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kursbevis URL
                </label>
                <input
                  type="text"
                  value={formData.certificate_url}
                  onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Link til PDF-bevis"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deltakerliste URL
                </label>
                <input
                  type="text"
                  value={formData.participant_list_url}
                  onChange={(e) => setFormData({ ...formData, participant_list_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Link til signert deltakerliste"
                />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kurs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ansvarlig</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokumenter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Ingen registreringer funnet
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{record.employee_name}</div>
                      {record.employee_id && (
                        <div className="text-sm text-gray-500">ID: {record.employee_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{record.course_name}</div>
                      {record.instructor && (
                        <div className="text-sm text-gray-500">Instruktør: {record.instructor}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.course_date).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.responsible_person}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'completed' ? 'bg-green-100 text-green-800' :
                        record.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status === 'completed' ? 'Fullført' :
                         record.status === 'expired' ? 'Utløpt' : 'Pågående'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {record.certificate_url && (
                          <a
                            href={record.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                            title="Kursbevis"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        {record.participant_list_url && (
                          <a
                            href={record.participant_list_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline text-sm"
                            title="Deltakerliste"
                          >
                            <User className="w-4 h-4" />
                          </a>
                        )}
                      </div>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
