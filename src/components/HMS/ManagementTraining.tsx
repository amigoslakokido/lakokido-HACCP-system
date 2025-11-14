import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  GraduationCap,
  Save,
  Edit2,
  Upload,
  Download,
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ManagementTrainingInfo {
  id: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  manager_position: string;
  course_name: string;
  course_provider: string;
  completion_date: string | null;
  status: string;
  renewal_recommendation: string;
  current_certificate_url: string;
  purpose_text: string;
  notes: string;
}

interface TrainingHistory {
  id: string;
  certificate_url: string;
  course_name: string;
  completion_date: string;
  uploaded_by: string;
  uploaded_at: string;
  notes: string;
}

export function ManagementTraining() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [trainingInfo, setTrainingInfo] = useState<ManagementTrainingInfo | null>(null);
  const [history, setHistory] = useState<TrainingHistory[]>([]);

  const [formData, setFormData] = useState({
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    manager_position: 'Daglig leder',
    course_name: 'HMS opplæring for ledere',
    course_provider: '',
    completion_date: '',
    status: 'not_completed',
    renewal_recommendation: 'Anbefalt fornyelse hvert 3–5 år',
    current_certificate_url: '',
    purpose_text: 'HMS-opplæring for ledelse sikrer at daglig leder har nødvendig kompetanse til å ivareta arbeidsmiljøet, forebygge skader og ulykker, og oppfylle lovpålagte krav til helse, miljø og sikkerhet i virksomheten. Opplæringen gir innsikt i HMS-systemet, risikovurdering, og lederens ansvar for et godt og sikkert arbeidsmiljø.',
    notes: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTrainingInfo(),
        loadHistory()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingInfo = async () => {
    const { data, error } = await supabase
      .from('hms_management_training_info')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (data) {
      setTrainingInfo(data);
      setFormData({
        manager_name: data.manager_name || '',
        manager_phone: data.manager_phone || '',
        manager_email: data.manager_email || '',
        manager_position: data.manager_position || 'Daglig leder',
        course_name: data.course_name || 'HMS opplæring for ledere',
        course_provider: data.course_provider || '',
        completion_date: data.completion_date || '',
        status: data.status || 'not_completed',
        renewal_recommendation: data.renewal_recommendation || 'Anbefalt fornyelse hvert 3–5 år',
        current_certificate_url: data.current_certificate_url || '',
        purpose_text: data.purpose_text || '',
        notes: data.notes || ''
      });
    }
  };

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('hms_training_history')
      .select('*')
      .order('completion_date', { ascending: false });

    if (error) throw error;
    setHistory(data || []);
  };

  const saveTrainingInfo = async () => {
    try {
      if (trainingInfo?.id) {
        await supabase
          .from('hms_management_training_info')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', trainingInfo.id);
      } else {
        await supabase
          .from('hms_management_training_info')
          .insert([formData]);
      }

      setEditing(false);
      await loadTrainingInfo();
      alert('Informasjon lagret!');
    } catch (error) {
      console.error('Error saving info:', error);
      alert('Kunne ikke lagre informasjon');
    }
  };

  const addToHistory = async () => {
    if (!formData.current_certificate_url || !formData.completion_date) {
      alert('Vennligst legg til kursbevis URL og fullføringsdato først');
      return;
    }

    const uploadedBy = formData.manager_name || 'Ikke angitt';

    try {
      await supabase
        .from('hms_training_history')
        .insert([{
          certificate_url: formData.current_certificate_url,
          course_name: formData.course_name,
          completion_date: formData.completion_date,
          uploaded_by: uploadedBy,
          notes: formData.notes
        }]);

      await loadHistory();
      alert('Lagt til i historikk!');
    } catch (error) {
      console.error('Error adding to history:', error);
      alert('Kunne ikke legge til i historikk');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('HMS opplæring - Ledelse', 14, yPos);
    yPos += 15;

    if (trainingInfo) {
      doc.setFontSize(12);

      doc.setFont('helvetica', 'bold');
      doc.text('Daglig leder:', 14, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Navn: ${trainingInfo.manager_name || 'Ikke angitt'}`, 14, yPos);
      yPos += 6;
      doc.text(`Telefon: ${trainingInfo.manager_phone || 'Ikke angitt'}`, 14, yPos);
      yPos += 6;
      doc.text(`E-post: ${trainingInfo.manager_email || 'Ikke angitt'}`, 14, yPos);
      yPos += 6;
      doc.text(`Stilling: ${trainingInfo.manager_position}`, 14, yPos);
      yPos += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('Kursinformasjon:', 14, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`Kursnavn: ${trainingInfo.course_name}`, 14, yPos);
      yPos += 6;
      doc.text(`Leverandor: ${trainingInfo.course_provider || 'Ikke angitt'}`, 14, yPos);
      yPos += 6;
      doc.text(`Dato fullfort: ${trainingInfo.completion_date ? new Date(trainingInfo.completion_date).toLocaleDateString('nb-NO') : 'Ikke angitt'}`, 14, yPos);
      yPos += 6;
      doc.text(`Status: ${trainingInfo.status === 'completed' ? 'Fullfort' : 'Ikke fullfort'}`, 14, yPos);
      yPos += 6;
      doc.text(trainingInfo.renewal_recommendation, 14, yPos);
      yPos += 12;

      doc.setFont('helvetica', 'bold');
      doc.text('Formal med HMS-opplæring:', 14, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const purposeLines = doc.splitTextToSize(trainingInfo.purpose_text, 180);
      doc.text(purposeLines, 14, yPos);
      yPos += (purposeLines.length * 6) + 6;

      if (trainingInfo.notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notater:', 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(trainingInfo.notes, 180);
        doc.text(notesLines, 14, yPos);
      }
    }

    doc.save('hms-opplæring-ledelse.pdf');
  };

  if (loading) {
    return <div className="text-center py-8">Laster...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="text-blue-600" />
            HMS opplæring - Ledelse
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Opplæring og sertifisering for daglig leder
          </p>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4" />
                Rediger
              </button>
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Last ned PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {editing ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informasjon om daglig leder
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Navn *</label>
                  <input
                    type="text"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Fullt navn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.manager_phone}
                    onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="+47 xxx xx xxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                  <input
                    type="email"
                    value={formData.manager_email}
                    onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="epost@eksempel.no"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stilling</label>
                  <input
                    type="text"
                    value={formData.manager_position}
                    onChange={(e) => setFormData({ ...formData, manager_position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Kursinformasjon
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kursnavn</label>
                    <input
                      type="text"
                      value={formData.course_name}
                      onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kursleverandør</label>
                    <input
                      type="text"
                      value={formData.course_provider}
                      onChange={(e) => setFormData({ ...formData, course_provider: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Navn på leverandør"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dato fullført</label>
                    <input
                      type="date"
                      value={formData.completion_date}
                      onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="not_completed">Ikke fullført</option>
                      <option value="completed">Fullført</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornyelsesanbefaling</label>
                  <input
                    type="text"
                    value={formData.renewal_recommendation}
                    onChange={(e) => setFormData({ ...formData, renewal_recommendation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kursbevis URL
                  </label>
                  <input
                    type="text"
                    value={formData.current_certificate_url}
                    onChange={(e) => setFormData({ ...formData, current_certificate_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="URL til PDF-kursbevis"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Last opp PDF til et filhotell og lim inn URL her
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Formål med HMS-opplæring</h3>
              <textarea
                value={formData.purpose_text}
                onChange={(e) => setFormData({ ...formData, purpose_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={5}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Notater og dokumentasjon</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Legg til notater, kommentarer eller annen dokumentasjon..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={saveTrainingInfo}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Lagre
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Avbryt
              </button>
              {formData.current_certificate_url && formData.completion_date && (
                <button
                  onClick={addToHistory}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto"
                >
                  <Upload className="w-4 h-4" />
                  Legg til i historikk
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informasjon om daglig leder
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Navn</p>
                  <p className="text-gray-900">{trainingInfo?.manager_name || 'Ikke angitt'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefon</p>
                  <p className="text-gray-900">{trainingInfo?.manager_phone || 'Ikke angitt'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">E-post</p>
                  <p className="text-gray-900">{trainingInfo?.manager_email || 'Ikke angitt'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stilling</p>
                  <p className="text-gray-900">{trainingInfo?.manager_position || 'Daglig leder'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Kursinformasjon
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kursnavn</p>
                    <p className="text-gray-900">{trainingInfo?.course_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kursleverandør</p>
                    <p className="text-gray-900">{trainingInfo?.course_provider || 'Ikke angitt'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dato fullført</p>
                    <p className="text-gray-900">
                      {trainingInfo?.completion_date
                        ? new Date(trainingInfo.completion_date).toLocaleDateString('nb-NO')
                        : 'Ikke angitt'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="flex items-center gap-2">
                      {trainingInfo?.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-600 font-semibold">Fullført</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="text-red-600 font-semibold">Ikke fullført</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-2">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Fornyelsesanbefaling</p>
                    <p className="text-sm text-blue-700">{trainingInfo?.renewal_recommendation}</p>
                  </div>
                </div>

                {trainingInfo?.current_certificate_url && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Kursbevis</p>
                      <a
                        href={trainingInfo.current_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Åpne PDF
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Formål med HMS-opplæring
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{trainingInfo?.purpose_text}</p>
              </div>
            </div>

            {trainingInfo?.notes && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Notater og dokumentasjon</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{trainingInfo.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Historikk / Logg
        </h3>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="w-5 h-5 text-red-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{entry.course_name}</p>
                  <p className="text-sm text-gray-600">
                    Fullført: {new Date(entry.completion_date).toLocaleDateString('nb-NO')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Lastet opp av: {entry.uploaded_by} - {new Date(entry.uploaded_at).toLocaleDateString('nb-NO')}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-700 mt-2">{entry.notes}</p>
                  )}
                  <a
                    href={entry.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Se kursbevis
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Ingen historikk registrert</p>
        )}
      </div>
    </div>
  );
}
