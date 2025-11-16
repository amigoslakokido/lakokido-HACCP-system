import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, User, TrendingUp, Eye, Trash2, Download, Search } from 'lucide-react';
import jsPDF from 'jspdf';

interface TaskDetail {
  task_name_no: string;
  task_icon: string;
  completed: boolean;
}

interface RoutineReport {
  id: string;
  report_date: string;
  generated_by: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  created_at: string;
  task_details?: TaskDetail[];
  employee_name?: string;
}

export function CompactRoutineReportsList() {
  const [reports, setReports] = useState<RoutineReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<RoutineReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from('daily_routine_reports')
        .select('*')
        .order('report_date', { ascending: false });

      if (error) throw error;

      const reportsWithEmployees = await Promise.all(
        (reportsData || []).map(async (report) => {
          const { data: employee } = await supabase
            .from('employees')
            .select('name')
            .eq('id', report.generated_by)
            .maybeSingle();

          const { data: details } = await supabase
            .from('routine_report_task_details')
            .select('task_name_no, task_icon, completed')
            .eq('report_id', report.id);

          return {
            ...report,
            employee_name: employee?.name || 'Ukjent',
            task_details: details || []
          };
        })
      );

      setReports(reportsWithEmployees);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne rapporten?')) return;

    try {
      const { error } = await supabase
        .from('daily_routine_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReports(reports.filter(r => r.id !== id));
      alert('Rapport slettet!');
    } catch (error) {
      console.error('Error:', error);
      alert('Feil ved sletting');
    }
  };

  const downloadPDF = (report: RoutineReport) => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('DAGLIG RUTINE RAPPORT', 105, yPos, { align: 'center' });

    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dato:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(report.report_date).toLocaleDateString('nb-NO'), 50, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Ansatt:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(report.employee_name || 'Ukjent', 50, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Fullforingsprosent:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${Math.round(report.completion_percentage)}%`, 70, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Oppgaver:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${report.completed_tasks} / ${report.total_tasks}`, 50, yPos);

    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Oppgavedetaljer:', 20, yPos);
    yPos += 7;

    if (report.task_details && report.task_details.length > 0) {
      report.task_details.forEach(task => {
        doc.setFont('helvetica', 'normal');
        const status = task.completed ? '[X]' : '[ ]';
        doc.text(`${status} ${task.task_icon} ${task.task_name_no}`, 25, yPos);
        yPos += 7;
      });
    }

    doc.save(`rutine-rapport-${report.report_date}.pdf`);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600 bg-emerald-100 border-emerald-300';
    if (percentage >= 70) return 'text-blue-600 bg-blue-100 border-blue-300';
    if (percentage >= 50) return 'text-amber-600 bg-amber-100 border-amber-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  const filteredReports = reports.filter(report =>
    report.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.report_date.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (viewingReport) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setViewingReport(null)}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Tilbake til oversikt
        </button>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Rutine Rapport</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Dato:</span>
              <span className="ml-2 font-medium">{new Date(viewingReport.report_date).toLocaleDateString('nb-NO')}</span>
            </div>
            <div>
              <span className="text-gray-600">Ansatt:</span>
              <span className="ml-2 font-medium">{viewingReport.employee_name}</span>
            </div>
            <div>
              <span className="text-gray-600">Oppgaver:</span>
              <span className="ml-2 font-medium">{viewingReport.completed_tasks} / {viewingReport.total_tasks}</span>
            </div>
            <div>
              <span className="text-gray-600">Prosent:</span>
              <span className={`ml-2 font-bold ${getPercentageColor(viewingReport.completion_percentage)}`}>
                {Math.round(viewingReport.completion_percentage)}%
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-3">Oppgavedetaljer</h3>
            <div className="space-y-2">
              {viewingReport.task_details && viewingReport.task_details.length > 0 ? (
                viewingReport.task_details.map((task, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{task.task_icon}</span>
                    <span className={`flex-1 ${task.completed ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                      {task.task_name_no}
                    </span>
                    {task.completed ? (
                      <span className="text-green-600 font-bold">✓</span>
                    ) : (
                      <span className="text-red-600 font-bold">✗</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Ingen oppgavedetaljer</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => downloadPDF(viewingReport)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Last ned PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Søk etter dato eller ansatt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-emerald-500">
          <div className="text-2xl font-bold text-emerald-600">{reports.length}</div>
          <div className="text-sm text-gray-600">Totale rapporter</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(reports.reduce((sum, r) => sum + r.completion_percentage, 0) / (reports.length || 1))}%
          </div>
          <div className="text-sm text-gray-600">Gj.snitt fullføring</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">
            {reports.filter(r => r.completion_percentage >= 90).length}
          </div>
          <div className="text-sm text-gray-600">Utmerkede (≥90%)</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Dato</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Ansatt</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Oppgaver</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fullføring</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Ingen rapporter funnet
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.report_date).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {report.employee_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {report.completed_tasks} / {report.total_tasks}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getPercentageColor(report.completion_percentage)}`}>
                        {Math.round(report.completion_percentage)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewingReport(report)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Vis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadPDF(report)}
                          className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                          title="Last ned PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
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
