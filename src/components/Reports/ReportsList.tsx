import { useState, useEffect } from 'react';
import { supabase, DailyReport } from '../../lib/supabase';
import { FileText, Download, Trash2, FileCheck, Calendar, AlertCircle, Eye, CreditCard as Edit3, Printer, Search } from 'lucide-react';
import { generateIntelligentReport } from './ReportGenerator';
import { ReportPDF } from './ReportPDF';
import { ReportEditor } from './ReportEditor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ReportsList() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [viewingReport, setViewingReport] = useState<DailyReport | null>(null);
  const [reportDetails, setReportDetails] = useState<any>(null);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    console.log('🔄 reportDetails changed:', {
      hasDetails: !!reportDetails,
      tempLogs: reportDetails?.tempLogs?.length || 0,
      cleaningLogs: reportDetails?.cleaningLogs?.length || 0
    });
  }, [reportDetails]);

  const loadReports = async () => {
    try {
      const { data } = await supabase
        .from('daily_reports')
        .select('*')
        .order('report_date', { ascending: false });

      if (data) {
        setReports(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (date: string) => {
    try {
      setGenerating(true);

      const report = await generateIntelligentReport({
        date,
        includeViolations: true,
        violationCount: Math.floor(Math.random() * 3) + 1,
      });

      if (report) {
        const existingIndex = reports.findIndex(r => r.id === report.id);
        if (existingIndex >= 0) {
          setReports(reports.map(r => r.id === report.id ? report : r));
        } else {
          setReports([report, ...reports]);
        }
      }

      await loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Feil ved opprettelse av rapport: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const generateBulkReports = async () => {
    if (!bulkStartDate || !bulkEndDate) return;

    setGenerating(true);

    const dates: string[] = [];
    const startDate = new Date(bulkStartDate + 'T12:00:00');
    const endDate = new Date(bulkEndDate + 'T12:00:00');

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generating ${dates.length} reports from ${bulkStartDate} to ${bulkEndDate}`);
    console.log('Dates:', dates);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      console.log(`[${i + 1}/${dates.length}] Generating report for: ${date}`);

      try {
        const report = await generateIntelligentReport({
          date,
          includeViolations: true,
          violationCount: Math.floor(Math.random() * 3) + 1,
        });

        if (report) {
          successCount++;
          console.log(`✓ Report created for ${date}`);
        }
      } catch (error) {
        failCount++;
        console.error(`✗ Failed to generate report for ${date}:`, error);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    await loadReports();

    setGenerating(false);
    setBulkStartDate('');
    setBulkEndDate('');

    alert(`Ferdig! ${successCount} rapporter opprettet, ${failCount} feilet.`);
  };

  const viewReport = async (report: DailyReport) => {
    console.log('📊 Loading report details for date:', report.report_date);
    setViewingReport(report);

    try {
      const { data: tempLogs, error: tempError } = await supabase
        .from('temperature_logs')
        .select(`
          *,
          equipment (
            name,
            min_temp,
            max_temp,
            zones (name)
          ),
          employees:recorded_by (name)
        `)
        .eq('log_date', report.report_date)
        .order('log_time', { ascending: true });

      console.log('🌡️ Temperature logs loaded:', tempLogs?.length || 0, 'records');
      if (tempError) console.error('❌ Temperature logs error:', tempError);

      const { data: cleaningLogs, error: cleaningError } = await supabase
        .from('cleaning_logs')
        .select(`
          *,
          cleaning_tasks (task_name, frequency),
          employees:completed_by (name)
        `)
        .eq('log_date', report.report_date)
        .order('log_time', { ascending: true });

      console.log('🧹 Cleaning logs loaded:', cleaningLogs?.length || 0, 'records');
      if (cleaningError) console.error('❌ Cleaning logs error:', cleaningError);

      const { data: hygieneChecks, error: hygieneError } = await supabase
        .from('hygiene_checks')
        .select('*')
        .eq('check_date', report.report_date);

      console.log('🧼 Hygiene checks loaded:', hygieneChecks?.length || 0, 'records');
      if (hygieneError) console.error('❌ Hygiene checks error:', hygieneError);

      const { data: coolingLogs, error: coolingError } = await supabase
        .from('cooling_logs')
        .select('*')
        .eq('log_date', report.report_date);

      console.log('❄️ Cooling logs loaded:', coolingLogs?.length || 0, 'records');
      if (coolingError) console.error('❌ Cooling logs error:', coolingError);

      const details = { tempLogs, cleaningLogs, hygieneChecks, coolingLogs };
      console.log('📦 Setting report details:', details);

      setReportDetails(details);
      console.log('✅ Report details set successfully');
    } catch (error) {
      console.error('❌ Error loading report details:', error);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne rapporten?')) return;

    try {
      await supabase.from('temperature_logs').delete().eq('log_date', reports.find(r => r.id === id)?.report_date || '');
      await supabase.from('cleaning_logs').delete().eq('log_date', reports.find(r => r.id === id)?.report_date || '');
      await supabase.from('daily_reports').delete().eq('id', id);
      setReports(reports.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const deleteBulkReports = async () => {
    if (selectedReports.length === 0) return;
    if (!confirm(`Er du sikker på at du vil slette ${selectedReports.length} rapporter?`)) return;

    try {
      for (const id of selectedReports) {
        const report = reports.find(r => r.id === id);
        if (report) {
          await supabase.from('temperature_logs').delete().eq('log_date', report.report_date);
          await supabase.from('cleaning_logs').delete().eq('log_date', report.report_date);
          await supabase.from('daily_reports').delete().eq('id', id);
        }
      }
      setReports(reports.filter(r => !selectedReports.includes(r.id)));
      setSelectedReports([]);
    } catch (error) {
      console.error('Error deleting reports:', error);
    }
  };

  const toggleReportSelection = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(r => r.id));
    }
  };

  const downloadReport = async (report: DailyReport) => {
    try {
      const { data: tempLogs } = await supabase
        .from('temperature_logs')
        .select(`
          *,
          equipment (
            name,
            min_temp,
            max_temp,
            zones (name)
          ),
          employees:recorded_by (name)
        `)
        .eq('log_date', report.report_date)
        .order('log_time', { ascending: true });

      const { data: cleaningLogs } = await supabase
        .from('cleaning_logs')
        .select(`
          *,
          cleaning_tasks (task_name, frequency),
          employees:completed_by (name)
        `)
        .eq('log_date', report.report_date)
        .order('log_time', { ascending: true });

      const { data: hygieneChecks } = await supabase
        .from('hygiene_checks')
        .select('*')
        .eq('check_date', report.report_date);

      const { data: coolingLogs } = await supabase
        .from('cooling_logs')
        .select('*')
        .eq('log_date', report.report_date);

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      const { ReportPDF } = await import('./ReportPDF');
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempDiv);

      await new Promise<void>((resolve) => {
        root.render(
          <ReportPDF
            report={report}
            tempLogs={tempLogs || []}
            cleaningLogs={cleaningLogs || []}
            hygieneChecks={hygieneChecks || []}
            coolingLogs={coolingLogs || []}
          />
        );
        setTimeout(resolve, 1000);
      });

      const element = tempDiv.querySelector('#printable-report') as HTMLElement;
      if (!element) {
        document.body.removeChild(tempDiv);
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `HACCP_Rapport_${new Date(report.report_date).toLocaleDateString('nb-NO').replace(/\./g, '-')}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Det oppstod en feil ved nedlasting av rapport');
    }
  };

  const downloadBulkReports = async () => {
    if (selectedReports.length === 0) return;

    try {
      for (const reportId of selectedReports) {
        const report = reports.find(r => r.id === reportId);
        if (report) {
          await downloadReport(report);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      alert(`${selectedReports.length} rapporter lastet ned!`);
    } catch (error) {
      console.error('Error downloading bulk reports:', error);
      alert('Det oppstod en feil ved nedlasting av rapporter');
    }
  };

  const editReport = async (report: DailyReport) => {
    console.log('✏️ Edit button clicked for report:', report.report_date);

    try {
      // Load data first
      console.log('📥 Loading report data...');

      const { data: tempLogs } = await supabase
        .from('temperature_logs')
        .select(`
          *,
          equipment (
            name,
            min_temp,
            max_temp,
            zones (name)
          ),
          employees:recorded_by (name)
        `)
        .eq('log_date', report.report_date)
        .order('log_time', { ascending: true });

      const { data: cleaningLogs } = await supabase
        .from('cleaning_logs')
        .select(`
          *,
          cleaning_tasks (task_name, frequency, description),
          employees:completed_by (name)
        `)
        .eq('log_date', report.report_date)
        .order('log_time', { ascending: true });

      console.log('✅ Data loaded:', {
        tempLogs: tempLogs?.length || 0,
        cleaningLogs: cleaningLogs?.length || 0
      });

      // Set both state values together
      const details = { tempLogs: tempLogs || [], cleaningLogs: cleaningLogs || [] };
      setReportDetails(details);
      setEditingReport(report);

      console.log('✅ Editor should now open');
    } catch (error) {
      console.error('❌ Error loading report data:', error);
      alert('Feil ved lasting av rapport: ' + (error as Error).message);
    }
  };

  const handleEditSave = async () => {
    setEditingReport(null);
    setReportDetails(null);
    await loadReports();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <FileCheck className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-emerald-50 border-emerald-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'danger': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'safe': return 'Trygt';
      case 'warning': return 'Advarsel';
      case 'danger': return 'Fare';
      default: return 'Ukjent';
    }
  };

  const filteredReports = reports.filter(report => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const dateStr = new Date(report.report_date).toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).toLowerCase();
    const statusStr = getStatusLabel(report.overall_status).toLowerCase();

    return dateStr.includes(query) || statusStr.includes(query);
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    const dateA = new Date(a.report_date).getTime();
    const dateB = new Date(b.report_date).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(sortedReports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const paginatedReports = sortedReports.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Laster...</div>
      </div>
    );
  }

  if (viewingReport && reportDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewingReport(null);
                setReportDetails(null);
              }}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {new Date(viewingReport.report_date).toLocaleDateString('nb-NO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <p className="text-slate-600">Status: {getStatusLabel(viewingReport.overall_status)}</p>
            </div>
          </div>
        </div>

        <ReportPDF
          report={viewingReport}
          tempLogs={reportDetails.tempLogs || []}
          cleaningLogs={reportDetails.cleaningLogs || []}
          hygieneChecks={reportDetails.hygieneChecks || []}
          coolingLogs={reportDetails.coolingLogs || []}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">HACCP Rapporter</h2>
          <p className="text-slate-600">Interkontroll rapport - LA kokido</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hidden">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Opprett ny rapport</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Velg dato
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => generateReport(selectedDate)}
              disabled={generating}
              className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {generating ? 'Oppretter...' : 'Opprett rapport'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Masseopprett rapporter</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fra dato
                </label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Til dato
                </label>
                <input
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={generateBulkReports}
              disabled={generating || !bulkStartDate || !bulkEndDate}
              className="w-full bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              {generating ? 'Oppretter...' : 'Masseopprett'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Alle rapporter</h3>
              <p className="text-sm text-slate-600 mt-1">Sortert etter dato (nyeste først)</p>
            </div>
            {selectedReports.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={downloadBulkReports}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Last ned {selectedReports.length} PDF{selectedReports.length > 1 ? 'er' : ''}
                </button>
                <button
                  onClick={deleteBulkReports}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Slett {selectedReports.length} rapport{selectedReports.length > 1 ? 'er' : ''}
                </button>
              </div>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Søk etter dato eller status..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {reports.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedReports.length === reports.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-600">Velg alle</span>
            </label>
          )}
        </div>

        <div className="divide-y divide-slate-200">
          {paginatedReports.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchQuery ? 'Ingen rapporter funnet' : 'Ingen rapporter ennå'}</p>
            </div>
          ) : (
            paginatedReports.map((report) => (
              <div
                key={report.id}
                className={`p-6 hover:bg-slate-50 transition-colors ${getStatusColor(report.overall_status)} border-l-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => toggleReportSelection(report.id)}
                      className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
                    />
                    {getStatusIcon(report.overall_status)}
                    <div>
                      <div className="font-semibold text-slate-900">
                        {new Date(report.report_date).toLocaleDateString('nb-NO', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Status: <span className="font-medium">{getStatusLabel(report.overall_status)}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Utarbeidet: {new Date(report.report_date + 'T12:00:00').toLocaleDateString('nb-NO', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewReport(report)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Se rapport"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => downloadReport(report)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Last ned PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => editReport(report)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Rediger rapport"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Slett rapport"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Viser {startIndex + 1}-{Math.min(endIndex, sortedReports.length)} av {sortedReports.length} rapporter
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Forrige
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Neste
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {(() => {
        console.log('🔍 Editor render check:', {
          editingReport: !!editingReport,
          reportDetails: !!reportDetails,
          shouldRender: !!(editingReport && reportDetails)
        });

        if (editingReport && reportDetails) {
          console.log('✅ Rendering editor with data:', {
            tempLogs: reportDetails.tempLogs?.length || 0,
            cleaningLogs: reportDetails.cleaningLogs?.length || 0
          });
        }

        return null;
      })()}

      {editingReport && reportDetails && (
        <ReportEditor
          reportDate={editingReport.report_date}
          tempLogs={reportDetails.tempLogs || []}
          cleaningLogs={reportDetails.cleaningLogs || []}
          onClose={() => {
            setEditingReport(null);
            setReportDetails(null);
          }}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
