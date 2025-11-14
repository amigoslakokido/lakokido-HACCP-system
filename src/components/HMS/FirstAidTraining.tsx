import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, Plus, Save, Edit2, Trash2, FileText, AlertCircle } from 'lucide-react';

interface FirstAidRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  course_name: string;
  course_provider: string;
  course_date: string;
  certificate_url: string;
  valid_from: string | null;
  valid_until: string | null;
  status: string;
  notes: string;
}

export function FirstAidTraining() {
  const [records, setRecords] = useState<FirstAidRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    course_name: 'Førstehjelp',
    course_provider: '',
    course_date: new Date().toISOString().split('T')[0],
    certificate_url: '',
    valid_from: '',
    valid_until: '',
    status: 'valid',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('training_first_aid')
      .select('*')
      .order('course_date', { ascending: false });

    if (!error && data) {
      const updatedData = data.map(record => ({
        ...record,
        status: calculateStatus(record.valid_until)
      }));
      setRecords(updatedData);
    }
    setLoading(false);
  };

  const calculateStatus = (validUntil: string | null): string => {
    if (!validUntil) return 'valid';

    const expiryDate = new Date(validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 90) return 'expiring_soon';
    return 'valid';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      status: calculateStatus(formData.valid_until)
    };

    if (editingId) {
      await supabase
        .from('training_first_aid')
        .update(dataToSave)
        .eq('id', editingId);
    } else {
      await supabase
        .from('training_first_aid')
        .insert([dataToSave]);
    }

    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne registreringen?')) return;

    await supabase
      .from('training_first_aid')
      .delete()
      .eq('id', id);

    loadRecords();
  };

  const handleEdit = (record: FirstAidRecord) => {
    setFormData({
      employee_name: record.employee_name,
      employee_id: record.employee_id,
      course_name: record.course_name,
      course_provider: record.course_provider,
      course_date: record.course_date,
      certificate_url: record.certificate_url,
      valid_from: record.valid_from || '',
      valid_until: record.valid_until || '',
      status: record.status,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employee_name: '',
      employee_id: '',
      course_name: 'Førstehjelp',
      course_provider: '',
      course_date: new Date().toISOString().split('T')[0],
      certificate_url: '',
      valid_from: '',
      valid_until: '',
      status: 'valid',
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
            <Shield className="text-red-600" />
            Førstehjelpsopplæring
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registrering av ansatte som har deltatt i førstehjelpskurs
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          Ny registrering
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Rediger registrering' : 'Ny førstehjelpsopplæring'}
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
                  Kursleverandør
                </label>
                <input
                  type="text"
                  value={formData.course_provider}
                  onChange={(e) => setFormData({ ...formData, course_provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kursdato *
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
                  Gyldig fra
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gyldig til
                </label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gyldighet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bevis</th>
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
                      {record.course_provider && (
                        <div className="text-sm text-gray-500">{record.course_provider}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.course_date).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.valid_until ? (
                        <div>
                          <div>Til: {new Date(record.valid_until).toLocaleDateString('nb-NO')}</div>
                          {record.status === 'expiring_soon' && (
                            <div className="flex items-center gap-1 text-yellow-600 text-xs mt-1">
                              <AlertCircle className="w-3 h-3" />
                              Utløper snart
                            </div>
                          )}
                        </div>
                      ) : (
                        'Ikke angitt'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'valid' ? 'bg-green-100 text-green-800' :
                        record.status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'valid' ? 'Gyldig' :
                         record.status === 'expiring_soon' ? 'Utløper snart' : 'Utløpt'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.certificate_url && (
                        <a
                          href={record.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Åpne
                        </a>
                      )}
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
