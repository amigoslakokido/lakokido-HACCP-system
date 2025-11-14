import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Save, Edit2, Trash2, Download, PenTool } from 'lucide-react';
import jsPDF from 'jspdf';

interface ConfirmationRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  start_date: string;
  training_completed_date: string | null;
  topics_covered: string[];
  employee_signature: string;
  employee_signed_at: string | null;
  manager_signature: string;
  manager_signed_at: string | null;
  manager_name: string;
  status: string;
  notes: string;
}

const DEFAULT_TOPICS = [
  'HMS-regler og sikkerhetsprosedyrer',
  'Brannvern og evakueringsrutiner',
  'Førstehjelpsutstyr og -prosedyrer',
  'Personlig hygiene og håndvask',
  'Matvarehåndtering og temperaturkontroll',
  'Rengjøring og sanitering',
  'Bruk av kjøkkenutstyr og maskiner',
  'Arbeidsmiljø og ergonomi',
  'Rutiner for avfallshåndtering',
  'Rapportering av avvik og hendelser'
];

export function NewEmployeeConfirmation() {
  const [records, setRecords] = useState<ConfirmationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_name: '',
    employee_id: '',
    start_date: new Date().toISOString().split('T')[0],
    training_completed_date: '',
    topics_covered: [] as string[],
    employee_signature: '',
    manager_signature: '',
    manager_name: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('training_new_employee_confirmation')
      .select('*')
      .order('start_date', { ascending: false });

    if (data) setRecords(data);
    setLoading(false);
  };

  const handleTopicToggle = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics_covered: prev.topics_covered.includes(topic)
        ? prev.topics_covered.filter(t => t !== topic)
        : [...prev.topics_covered, topic]
    }));
  };

  const handleEmployeeSign = () => {
    const name = prompt('Skriv inn ditt navn for å signere:');
    if (name) {
      setFormData(prev => ({ ...prev, employee_signature: name }));
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
      formData.employee_signature ? 'employee_signed' :
      'pending';

    const dataToSave = {
      ...formData,
      topics_covered: JSON.stringify(formData.topics_covered),
      employee_signed_at: formData.employee_signature ? new Date().toISOString() : null,
      manager_signed_at: formData.manager_signature ? new Date().toISOString() : null,
      status
    };

    if (editingId) {
      await supabase
        .from('training_new_employee_confirmation')
        .update(dataToSave)
        .eq('id', editingId);
    } else {
      await supabase
        .from('training_new_employee_confirmation')
        .insert([dataToSave]);
    }

    resetForm();
    loadRecords();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker?')) return;
    await supabase.from('training_new_employee_confirmation').delete().eq('id', id);
    loadRecords();
  };

  const handleEdit = (record: ConfirmationRecord) => {
    setFormData({
      employee_name: record.employee_name,
      employee_id: record.employee_id,
      start_date: record.start_date,
      training_completed_date: record.training_completed_date || '',
      topics_covered: Array.isArray(record.topics_covered) ? record.topics_covered : [],
      employee_signature: record.employee_signature,
      manager_signature: record.manager_signature,
      manager_name: record.manager_name,
      notes: record.notes
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const generatePDF = (record: ConfirmationRecord) => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('Bekreftelse på opplæring for nyansatt', 14, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.text(`Navn: ${record.employee_name}`, 14, yPos);
    yPos += 7;
    doc.text(`Ansatt ID: ${record.employee_id || 'Ikke angitt'}`, 14, yPos);
    yPos += 7;
    doc.text(`Startdato: ${new Date(record.start_date).toLocaleDateString('nb-NO')}`, 14, yPos);
    yPos += 7;
    if (record.training_completed_date) {
      doc.text(`Opplæring fullført: ${new Date(record.training_completed_date).toLocaleDateString('nb-NO')}`, 14, yPos);
      yPos += 7;
    }
    yPos += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Opplæringstemaer:', 14, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');

    const topics = Array.isArray(record.topics_covered) ? record.topics_covered : [];
    topics.forEach(topic => {
      doc.text(`- ${topic}`, 14, yPos);
      yPos += 6;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Signaturer:', 14, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');

    if (record.employee_signature) {
      doc.text(`Medarbeider: ${record.employee_signature}`, 14, yPos);
      yPos += 6;
      if (record.employee_signed_at) {
        doc.text(`Dato: ${new Date(record.employee_signed_at).toLocaleDateString('nb-NO')}`, 14, yPos);
        yPos += 6;
      }
    }

    yPos += 5;
    if (record.manager_signature) {
      doc.text(`Leder: ${record.manager_signature}`, 14, yPos);
      yPos += 6;
      if (record.manager_signed_at) {
        doc.text(`Dato: ${new Date(record.manager_signed_at).toLocaleDateString('nb-NO')}`, 14, yPos);
      }
    }

    doc.save(`opplaering-bekreftelse-${record.employee_name}.pdf`);
  };

  const resetForm = () => {
    setFormData({
      employee_name: '',
      employee_id: '',
      start_date: new Date().toISOString().split('T')[0],
      training_completed_date: '',
      topics_covered: [],
      employee_signature: '',
      manager_signature: '',
      manager_name: '',
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
            <Users className="text-blue-600" />
            Bekreftelse på opplæring for nyansatte
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Formular med signering av både leder og medarbeider
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ny bekreftelse
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Rediger bekreftelse' : 'Ny opplæringsbekreftelse'}
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
                  Startdato *
                </label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opplæring fullført
                </label>
                <input
                  type="date"
                  value={formData.training_completed_date}
                  onChange={(e) => setFormData({ ...formData, training_completed_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Opplæringstemaer</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {DEFAULT_TOPICS.map((topic) => (
                  <label key={topic} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.topics_covered.includes(topic)}
                      onChange={() => handleTopicToggle(topic)}
                    />
                    <span className="text-sm text-gray-700">{topic}</span>
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ansatt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Startdato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fullført</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handlinger</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Ingen bekreftelser funnet
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
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(record.start_date).toLocaleDateString('nb-NO')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.training_completed_date
                      ? new Date(record.training_completed_date).toLocaleDateString('nb-NO')
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'employee_signed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status === 'completed' ? 'Fullført' :
                       record.status === 'employee_signed' ? 'Venter på leder' : 'Venter'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => generatePDF(record)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Last ned PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
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
  );
}
