import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Plus, Trash2, Edit2, CheckCircle, Clock, FileText, Upload, Download, X } from 'lucide-react';

interface CriticalIncident {
  id: string;
  title: string;
  description: string;
  ai_analysis: string | null;
  ai_consequences: string | null;
  ai_solutions: string | null;
  severity: 'critical' | 'high' | 'medium';
  status: 'open' | 'in_progress' | 'resolved';
  incident_date: string;
  reported_by: string;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface IncidentAttachment {
  id: string;
  incident_id: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'document';
  file_size: number;
}

export function CriticalIncidents() {
  const [incidents, setIncidents] = useState<CriticalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<CriticalIncident | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'critical' | 'high' | 'medium',
    incident_date: new Date().toISOString().split('T')[0],
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [attachments, setAttachments] = useState<IncidentAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('critical_incidents')
      .select('*')
      .order('incident_date', { ascending: false });

    if (!error && data) {
      setIncidents(data);
    }
    if (error) {
      console.error('Error loading incidents:', error);
    }
    setLoading(false);
  }

  async function loadAttachments(incidentId: string) {
    const { data } = await supabase
      .from('incident_attachments')
      .select('*')
      .eq('incident_id', incidentId);

    if (data) {
      setAttachments(data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Vennligst fyll ut tittel og beskrivelse');
      return;
    }

    setAiLoading(true);

    try {
      // Get AI analysis
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-incident`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
        }),
      });

      const aiData = await response.json();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      // Insert incident
      const { data: incident, error } = await supabase
        .from('critical_incidents')
        .insert({
          ...formData,
          reported_by: userId,
          ai_analysis: aiData.analysis,
          ai_consequences: aiData.consequences,
          ai_solutions: aiData.solutions,
        })
        .select()
        .single();

      if (error) throw error;

      alert('Rapport opprettet vellykket');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        incident_date: new Date().toISOString().split('T')[0],
      });
      loadIncidents();
    } catch (error) {
      console.error('Error:', error);
      alert('Det oppstod en feil ved opprettelse av rapport');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleStatusChange(incident: CriticalIncident, newStatus: 'open' | 'in_progress' | 'resolved') {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const updateData: any = { status: newStatus };

    if (newStatus === 'resolved') {
      updateData.resolved_by = userId;
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('critical_incidents')
      .update(updateData)
      .eq('id', incident.id);

    if (!error) {
      loadIncidents();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Er du sikker på at du vil slette denne rapporten?')) return;

    const { error } = await supabase
      .from('critical_incidents')
      .delete()
      .eq('id', id);

    if (!error) {
      loadIncidents();
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, incidentId: string) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${incidentId}/${Date.now()}-${i}.${fileExt}`;
        const fileType = file.type.startsWith('image/') ? 'image' : 'document';

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('incident-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('incident-files')
          .getPublicUrl(fileName);

        // Save attachment record
        await supabase.from('incident_attachments').insert({
          incident_id: incidentId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: fileType,
          file_size: file.size,
          uploaded_by: userId,
        });
      }

      loadAttachments(incidentId);
      alert('Filer lastet opp vellykket');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Det oppstod en feil ved opplasting av filer');
    } finally {
      setUploadingFiles(false);
    }
  }

  async function handleDeleteAttachment(attachmentId: string, fileUrl: string) {
    if (!confirm('Vil du slette denne filen?')) return;

    try {
      // Extract file path from URL
      const fileName = fileUrl.split('/incident-files/')[1];

      // Delete from storage
      await supabase.storage
        .from('incident-files')
        .remove([fileName]);

      // Delete record
      await supabase
        .from('incident_attachments')
        .delete()
        .eq('id', attachmentId);

      loadAttachments(selectedIncident!.id);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  }

  async function generatePDF(incident: CriticalIncident) {
    // Load attachments first
    const { data: attachmentsData } = await supabase
      .from('incident_attachments')
      .select('*')
      .eq('incident_id', incident.id);

    const html2pdf = (await import('jspdf')).default;
    const pdf = new html2pdf('p', 'mm', 'a4');

    let yPos = 20;
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Critical Incident Report', margin, yPos);
    yPos += 10;

    // Incident details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Title: ${incident.title}`, margin, yPos);
    yPos += 7;
    pdf.text(`Date: ${incident.incident_date}`, margin, yPos);
    yPos += 7;
    pdf.text(`Severity: ${incident.severity.toUpperCase()}`, margin, yPos);
    yPos += 7;
    pdf.text(`Status: ${incident.status.toUpperCase()}`, margin, yPos);
    yPos += 10;

    // Description
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description:', margin, yPos);
    yPos += 7;
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(incident.description, contentWidth);
    pdf.text(descLines, margin, yPos);
    yPos += descLines.length * 7 + 5;

    if (incident.ai_analysis) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Analysis:', margin, yPos);
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      const analysisLines = pdf.splitTextToSize(incident.ai_analysis, contentWidth);
      pdf.text(analysisLines, margin, yPos);
      yPos += analysisLines.length * 7 + 5;
    }

    if (incident.ai_consequences) {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFont('helvetica', 'bold');
      pdf.text('Consequences:', margin, yPos);
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      const conseqLines = pdf.splitTextToSize(incident.ai_consequences, contentWidth);
      pdf.text(conseqLines, margin, yPos);
      yPos += conseqLines.length * 7 + 5;
    }

    if (incident.ai_solutions) {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.setFont('helvetica', 'bold');
      pdf.text('Solutions:', margin, yPos);
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      const solLines = pdf.splitTextToSize(incident.ai_solutions, contentWidth);
      pdf.text(solLines, margin, yPos);
    }

    pdf.save(`incident-${incident.id}.pdf`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Laster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Kritiske hendelser</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ny hendelse
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Kritisk hendelsesrapport</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hendelsestittel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detaljert beskrivelse *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Beskriv hendelsen i detalj..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alvorlighetsgrad
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="medium">Moderat</option>
                  <option value="high">Høy</option>
                  <option value="critical">Kritisk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hendelsesdato
                </label>
                <input
                  type="date"
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={aiLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {aiLoading ? 'Genererer rapport...' : 'Generer rapport'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{incident.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                    {incident.severity === 'critical' ? 'Kritisk' : incident.severity === 'high' ? 'Høy' : 'Moderat'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(incident.status)}`}>
                    {getStatusIcon(incident.status)}
                    {incident.status === 'open' ? 'Åpen' : incident.status === 'in_progress' ? 'Under behandling' : 'Løst'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {incident.incident_date}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => generatePDF(incident)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Last ned PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedIncident(incident);
                    loadAttachments(incident.id);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Vis detaljer"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(incident.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Slett"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{incident.description}</p>

            {incident.status !== 'resolved' && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleStatusChange(incident, 'in_progress')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  disabled={incident.status === 'in_progress'}
                >
                  Under behandling
                </button>
                <button
                  onClick={() => handleStatusChange(incident, 'resolved')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  Løst
                </button>
              </div>
            )}
          </div>
        ))}

        {incidents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Ingen kritiske hendelser for øyeblikket</p>
          </div>
        )}
      </div>

      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Hendelsesdetaljer</h3>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2">{selectedIncident.title}</h4>
                <p className="text-gray-700">{selectedIncident.description}</p>
              </div>

              {selectedIncident.ai_analysis && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Analyse</h4>
                  <p className="text-blue-800 whitespace-pre-line">{selectedIncident.ai_analysis}</p>
                </div>
              )}

              {selectedIncident.ai_consequences && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Konsekvenser</h4>
                  <p className="text-orange-800 whitespace-pre-line">{selectedIncident.ai_consequences}</p>
                </div>
              )}

              {selectedIncident.ai_solutions && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Tiltak</h4>
                  <p className="text-green-800 whitespace-pre-line">{selectedIncident.ai_solutions}</p>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Vedlegg</h4>
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Last opp filer
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, selectedIncident.id)}
                      className="hidden"
                      disabled={uploadingFiles}
                    />
                  </label>
                </div>

                {attachments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Ingen vedlegg</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {attachment.file_type === 'image' ? (
                            <img src={attachment.file_url} alt={attachment.file_name} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <FileText className="w-12 h-12 text-gray-400" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{attachment.file_name}</p>
                            <p className="text-xs text-gray-500">{(attachment.file_size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAttachment(attachment.id, attachment.file_url)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
