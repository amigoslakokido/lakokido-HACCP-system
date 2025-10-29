import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Thermometer, Sparkles, FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    todayTemperatures: 0,
    totalTemperatures: 0,
    cleaningCompleted: 0,
    cleaningTotal: 0,
    recentReports: 0,
    warningCount: 0,
    dangerCount: 0,
    criticalIncidents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: tempLogs, count: tempCount } = await supabase
        .from('temperature_logs')
        .select('*', { count: 'exact' })
        .eq('log_date', today);

      const { count: totalTempItems } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      const warningCount = tempLogs?.filter(log => log.status === 'warning').length || 0;
      const dangerCount = tempLogs?.filter(log => log.status === 'danger').length || 0;

      const { data: cleaningLogs, count: cleaningCount } = await supabase
        .from('cleaning_logs')
        .select('*', { count: 'exact' })
        .eq('log_date', today)
        .eq('status', 'completed');

      const { count: totalCleaningTasks } = await supabase
        .from('cleaning_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: recentReportsCount } = await supabase
        .from('daily_reports')
        .select('*', { count: 'exact', head: true })
        .gte('report_date', weekAgo.toISOString().split('T')[0]);

      const { count: criticalIncidentsCount } = await supabase
        .from('critical_incidents')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'resolved');

      setStats({
        todayTemperatures: tempCount || 0,
        totalTemperatures: totalTempItems || 0,
        cleaningCompleted: cleaningCount || 0,
        cleaningTotal: totalCleaningTasks || 0,
        recentReports: recentReportsCount || 0,
        warningCount,
        dangerCount,
        criticalIncidents: criticalIncidentsCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Temperaturregistreringer',
      value: `${stats.todayTemperatures}/${stats.totalTemperatures}`,
      icon: Thermometer,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Rengjøring fullført',
      value: `${stats.cleaningCompleted}/${stats.cleaningTotal}`,
      icon: Sparkles,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      bgLight: 'bg-cyan-50',
    },
    {
      title: 'Rapporter (7 dager)',
      value: stats.recentReports,
      icon: FileText,
      color: 'bg-violet-500',
      textColor: 'text-violet-600',
      bgLight: 'bg-violet-50',
    },
    {
      title: 'Advarsler i dag',
      value: stats.warningCount,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
    },
    {
      title: 'Åpne kritiske hendelser',
      value: stats.criticalIncidents,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Laster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Oversikt</h1>
        <p className="text-slate-600">HACCP Digital Control System</p>
      </div>

      {stats.dangerCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Kritisk advarsel</h3>
              <p className="text-red-700 text-sm">
                {stats.dangerCount} temperaturavvik utenfor trygt område. Vennligst gjennomgå umiddelbart.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-slate-600 text-sm mb-1">{card.title}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">System status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-slate-900">Database tilkobling</span>
              </div>
              <span className="text-emerald-600 font-medium">Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-slate-900">Sanntidssynkronisering</span>
              </div>
              <span className="text-emerald-600 font-medium">Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-slate-900">HACCP overvåking</span>
              </div>
              <span className="text-emerald-600 font-medium">Aktiv</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Hurtighandlinger</h3>
          <div className="space-y-3">
            <a
              href="#temperature"
              className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Thermometer className="w-5 h-5 text-blue-600" />
              <span className="text-slate-900 font-medium">Registrer temperaturer</span>
            </a>
            <a
              href="#cleaning"
              className="flex items-center gap-3 p-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              <Sparkles className="w-5 h-5 text-cyan-600" />
              <span className="text-slate-900 font-medium">Loggfør rengjøring</span>
            </a>
            <a
              href="#reports"
              className="flex items-center gap-3 p-3 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 text-violet-600" />
              <span className="text-slate-900 font-medium">Generer rapport</span>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">LA kokido</h3>
            <p className="text-emerald-50">
              Digital kontrollsystem for mattrygghet og HACCP-overvåking
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-emerald-200" />
        </div>
      </div>
    </div>
  );
}
