import { useState, useEffect } from 'react';
import { hmsApi } from '../../lib/hmsSupabase';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  Leaf,
  Heart,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  reportsGenerated: number;
  avgComplianceScore: number;
}

export function HMSDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncidents: 0,
    openIncidents: 0,
    criticalIncidents: 0,
    reportsGenerated: 0,
    avgComplianceScore: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await hmsApi.getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">جاري التحميل... Laster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">HMS Dashboard</h1>
          <p className="text-slate-600 mt-1">لوحة التحكم - Helse, Miljø og Sikkerhet</p>
        </div>
        <div className="text-sm text-slate-500">
          آخر تحديث: {new Date().toLocaleString('nb-NO')}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-red-900">{stats.totalIncidents}</span>
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-1">Totale hendelser</h3>
          <p className="text-sm text-red-700">إجمالي الحوادث (7 أيام)</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-amber-900">{stats.openIncidents}</span>
          </div>
          <h3 className="text-lg font-bold text-amber-900 mb-1">Åpne saker</h3>
          <p className="text-sm text-amber-700">القضايا المفتوحة</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-purple-900">{stats.criticalIncidents}</span>
          </div>
          <h3 className="text-lg font-bold text-purple-900 mb-1">Kritiske hendelser</h3>
          <p className="text-sm text-purple-700">الحوادث الحرجة</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-emerald-900">{stats.avgComplianceScore}%</span>
          </div>
          <h3 className="text-lg font-bold text-emerald-900 mb-1">Compliance Score</h3>
          <p className="text-sm text-emerald-700">درجة الامتثال</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Rapporter</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700">Genererte rapporter</span>
              <span className="text-2xl font-black text-blue-600">{stats.reportsGenerated}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Kategorier</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <Shield className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">Sikkerhet</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">Miljø</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Heart className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Helse</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black mb-2">HMS Compliance System</h2>
            <p className="text-blue-100 text-lg">
              نظام متكامل للصحة والبيئة والسلامة وفقاً للوائح النرويجية
            </p>
            <p className="text-blue-100 mt-2">
              I henhold til Arbeidstilsynet og Mattilsynet forskrifter
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
