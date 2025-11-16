import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Eye, Download, Search, Edit, Trash2, Save, X } from 'lucide-react';
import jsPDF from 'jspdf';

interface CriticalIncident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  status: 'open' | 'in_progress' | 'resolved';
  incident_date: string;
  reported_by: string;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  ai_analysis?: string;
  ai_consequences?: string;
  ai_solutions?: string;
}

export function CriticalIncidentReports() {
  const [incidents, setIncidents] = useState<CriticalIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingIncident, setViewingIncident] = useState<CriticalIncident | null>(null);
  const [editingIncident, setEditingIncident] = useState<CriticalIncident | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('critical_incidents')
        .select('*')
        .order('incident_date', { ascending: false });

      if (error) throw error;
      if (data) setIncidents(data);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne hendelsen?')) return;

    try {
      const { error } = await supabase
        .from('critical_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIncidents(incidents.filter(i => i.id !== id));
      alert('Hendelse slettet!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Feil ved sletting');
    }
  };

  const handleUpdate = async () => {
    if (!editingIncident) return;

    try {
      const { error } = await supabase
        .from('critical_incidents')
        .update({
          title: editingIncident.title,
          description: editingIncident.description,
          severity: editingIncident.severity,
          status: editingIncident.status
        })
        .eq('id', editingIncident.id);

      if (error) throw error;

      setIncidents(incidents.map(i => i.id === editingIncident.id ? editingIncident : i));
      setEditingIncident(null);
      alert('Hendelse oppdatert!');
    } catch (error) {
      console.error('Error updating:', error);
      alert('Feil ved oppdatering');
    }
  };

  const downloadPDF = (incident: CriticalIncident) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('KRITISK HENDELSE RAPPORT', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tittel:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(incident.title, 50, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Dato:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(incident.incident_date).toLocaleDateString('nb-NO'), 50, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Alvorlighetsgrad:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(getSeverityLabel(incident.severity), 70, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(getStatusLabel(incident.status), 50, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Rapportert av:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(incident.reported_by, 60, yPos);

    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Beskrivelse:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(incident.description, pageWidth - 40);
    doc.text(descLines, 20, yPos);
    yPos += (descLines.length * 7);

    if (incident.ai_analysis) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('AI Analyse:', 20, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      const aiLines = doc.splitTextToSize(incident.ai_analysis, pageWidth - 40);
      doc.text(aiLines, 20, yPos);
    }

    doc.save(`kritisk-hendelse-${incident.id}.pdf`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'open': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'KRITISK';
      case 'high': return 'HØY';
      case 'medium': return 'MIDDELS';
      default: return severity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return 'Løst';
      case 'in_progress': return 'Under behandling';
      case 'open': return 'Åpen';
      default: return status;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (editingIncident) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Rediger hendelse</h2>
          <button
            onClick={() => setEditingIncident(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tittel</label>
            <input
              type="text"
              value={editingIncident.title}
              onChange={(e) => setEditingIncident({...editingIncident, title: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beskrivelse</label>
            <textarea
              value={editingIncident.description}
              onChange={(e) => setEditingIncident({...editingIncident, description: e.target.value})}
              rows={6}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alvorlighetsgrad</label>
              <select
                value={editingIncident.severity}
                onChange={(e) => setEditingIncident({...editingIncident, severity: e.target.value as any})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="critical">Kritisk</option>
                <option value="high">Høy</option>
                <option value="medium">Middels</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={editingIncident.status}
                onChange={(e) => setEditingIncident({...editingIncident, status: e.target.value as any})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="open">Åpen</option>
                <option value="in_progress">Under behandling</option>
                <option value="resolved">Løst</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpdate}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Lagre endringer
            </button>
            <button
              onClick={() => setEditingIncident(null)}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
            >
              Avbryt
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewingIncident) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setViewingIncident(null)}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Tilbake til oversikt
        </button>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{viewingIncident.title}</h2>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold border-2 ${getSeverityColor(viewingIncident.severity)}`}>
                {getSeverityLabel(viewingIncident.severity)}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-bold border-2 ${getStatusColor(viewingIncident.status)}`}>
                {getStatusLabel(viewingIncident.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Dato:</span>
              <span className="ml-2 font-medium">{new Date(viewingIncident.incident_date).toLocaleDateString('nb-NO')}</span>
            </div>
            <div>
              <span className="text-gray-600">Rapportert av:</span>
              <span className="ml-2 font-medium">{viewingIncident.reported_by}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-2">Beskrivelse</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{viewingIncident.description}</p>
          </div>

          {viewingIncident.ai_analysis && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">🤖 AI Analyse</h3>
              <p className="text-blue-800 text-sm">{viewingIncident.ai_analysis}</p>
            </div>
          )}

          {viewingIncident.ai_consequences && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <h3 className="font-bold text-orange-900 mb-2">⚠️ Konsekvenser</h3>
              <p className="text-orange-800 text-sm">{viewingIncident.ai_consequences}</p>
            </div>
          )}

          {viewingIncident.ai_solutions && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-2">✅ Foreslåtte løsninger</h3>
              <p className="text-green-800 text-sm">{viewingIncident.ai_solutions}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => downloadPDF(viewingIncident)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Last ned PDF
            </button>
            <button
              onClick={() => {
                setViewingIncident(null);
                setEditingIncident(viewingIncident);
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Rediger
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Søk i hendelser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="all">Alle alvorlighetsgrader</option>
              <option value="critical">Kritisk</option>
              <option value="high">Høy</option>
              <option value="medium">Middels</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="all">Alle statuser</option>
              <option value="open">Åpen</option>
              <option value="in_progress">Under behandling</option>
              <option value="resolved">Løst</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{incidents.filter(i => i.status === 'open').length}</div>
          <div className="text-sm text-gray-600">Åpne hendelser</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{incidents.filter(i => i.status === 'in_progress').length}</div>
          <div className="text-sm text-gray-600">Under behandling</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{incidents.filter(i => i.status === 'resolved').length}</div>
          <div className="text-sm text-gray-600">Løste</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-orange-600">{incidents.filter(i => i.severity === 'critical').length}</div>
          <div className="text-sm text-gray-600">Kritiske</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Dato</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tittel</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Alvorlighetsgrad</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Ingen hendelser funnet
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(incident.incident_date).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {incident.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${getSeverityColor(incident.severity)}`}>
                        {getSeverityLabel(incident.severity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(incident.status)}`}>
                        {getStatusLabel(incident.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewingIncident(incident)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Vis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingIncident(incident)}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          title="Rediger"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadPDF(incident)}
                          className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                          title="Last ned PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(incident.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Slett"
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
