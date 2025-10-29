import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Snowflake, Plus, Calendar, Clock, AlertCircle, Thermometer } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
}

interface CoolingLog {
  id: string;
  log_date: string;
  product_type?: string;
  product_name: string;
  temp_initial: number;
  temp_2h: number;
  temp_6h: number;
  total_duration_hours: number;
  recorded_by: string;
  status: 'safe' | 'warning' | 'danger';
  notes: string;
  created_at: string;
  profiles?: Profile;
}

export default function CoolingLog() {
  const defaultUserId = 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5';
  const [logs, setLogs] = useState<CoolingLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_type: '',
    product_name: '',
    temp_initial: '',
    temp_2h: '',
    temp_6h: '',
    total_duration_hours: '',
    notes: ''
  });

  const productTypes = [
    'Kebabkjøtt',
    'Kyllingkjøtt',
    'Kjøttsaus'
  ];

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cooling_logs')
      .select('*, profiles:recorded_by(id, full_name)')
      .eq('log_date', selectedDate)
      .order('created_at', { ascending: false });

    console.log('Cooling logs data:', data);
    console.log('Cooling logs error:', error);
    console.log('Selected date:', selectedDate);

    if (data) {
      // Keep only the most recent log per product
      const uniqueLogs = data.filter((log, index, self) =>
        index === self.findIndex((l) => l.product_name === log.product_name)
      );
      setLogs(uniqueLogs as any);
    }
    setLoading(false);
  };

  const calculateStatus = (tempInitial: number, temp2h: number, temp6h: number): 'safe' | 'warning' | 'danger' => {
    // Mattilsynet Rules:
    // Stage 1: +60°C to +20°C within 2 hours
    // Stage 2: +20°C to +10°C within 6 hours total

    if (tempInitial < 60) return 'warning';
    if (temp2h > 20) return 'danger';
    if (temp6h > 10) return 'danger';
    if (temp6h <= 4 && temp2h <= 15) return 'safe';
    return 'safe';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tempInitial = parseFloat(formData.temp_initial);
    const temp2h = parseFloat(formData.temp_2h);
    const temp6h = parseFloat(formData.temp_6h);
    const status = calculateStatus(tempInitial, temp2h, temp6h);

    try {
      // Check if cooling log already exists for this product on this date
      const { data: existingLog } = await supabase
        .from('cooling_logs')
        .select('*')
        .eq('product_name', formData.product_name)
        .eq('log_date', selectedDate)
        .maybeSingle();

      if (existingLog) {
        alert('سجل التبريد موجود بالفعل لهذا المنتج في هذا اليوم. لا يمكن إضافة سجل مكرر.');
        return;
      }

      const { error } = await supabase
        .from('cooling_logs')
        .insert({
          log_date: selectedDate,
          product_type: formData.product_type,
          product_name: formData.product_name,
          temp_initial: parseFloat(formData.temp_initial),
          temp_2h: temp2h,
          temp_6h: temp6h,
          total_duration_hours: parseFloat(formData.total_duration_hours),
          recorded_by: defaultUserId,
          status,
          notes: formData.notes
        });

      if (!error) {
        setShowForm(false);
        setFormData({
          product_type: '',
          product_name: '',
          temp_initial: '',
          temp_2h: '',
          temp_6h: '',
          total_duration_hours: '',
          notes: ''
        });
        loadLogs();
      } else {
        alert('حدث خطأ أثناء الحفظ. قد يكون السجل موجوداً بالفعل.');
      }
    } catch (error) {
      console.error('Error saving cooling log:', error);
      alert('حدث خطأ أثناء الحفظ. السجل موجود بالفعل لهذا اليوم.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'danger': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Sikker';
      case 'warning': return 'Advarsel';
      case 'danger': return 'Farlig';
      default: return 'Ukjent';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ny Nedkjøling
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-slate-600" />
          <label className="text-sm font-medium text-slate-700">Velg dato:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="bg-cyan-50 border-l-4 border-cyan-500 rounded-lg p-5 mt-4">
          <h3 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2 text-lg">
            <Thermometer className="w-5 h-5" />
            Mattilsynet Standard for Nedkjøling
          </h3>
          <div className="space-y-3 text-sm text-cyan-900">
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="font-semibold text-cyan-800 mb-2">⏱️ Sikker nedkjølingsgrenser (6-timers regel):</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-4">
                <div>
                  <span className="font-medium">Start (0t):</span>
                  <br/>
                  <span className="text-green-700 font-semibold">+60°C til +80°C</span>
                  <br/>
                  <span className="text-xs text-slate-600">(fersk tilberedt mat)</span>
                </div>
                <div>
                  <span className="font-medium">Etter 2 timer:</span>
                  <br/>
                  <span className="text-green-700 font-semibold">≤ +20°C</span>
                  <br/>
                  <span className="text-xs text-slate-600">(Stage 1 fullført)</span>
                </div>
                <div>
                  <span className="font-medium">Etter 6 timer:</span>
                  <br/>
                  <span className="text-green-700 font-semibold">≤ +10°C</span>
                  <br/>
                  <span className="text-xs text-slate-600">(klar for kjøleskap)</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-red-700">Viktig:</span>
                <span className="text-slate-700"> Hvis maten ikke når ≤+10°C innen 6 timer, eller &gt;+20°C etter 2t, må maten kasseres (Ikke godkjent).</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Ny Nedkjølingslogg</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type Mat
              </label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              >
                <option value="">Velg type...</option>
                {productTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Produkt / Rett
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="F.eks. Kjøttsaus, Pasta, Suppe..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temp. Start (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temp_initial}
                  onChange={(e) => setFormData({ ...formData, temp_initial: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="60"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temp. 2 timer (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temp_2h}
                  onChange={(e) => setFormData({ ...formData, temp_2h: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="21"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temp. 6 timer (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temp_6h}
                  onChange={(e) => setFormData({ ...formData, temp_6h: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Total tid (timer)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.total_duration_hours}
                  onChange={(e) => setFormData({ ...formData, total_duration_hours: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="6"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Merknader
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={3}
                placeholder="Valgfri merknader..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Lagre Logg
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">Nedkjølinger - {new Date(selectedDate).toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Laster...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Ingen nedkjølinger registrert for denne datoen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Produkt</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Start (°C)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">2 Timer (°C)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">6 Timer (°C)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Total Tid</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Registrert av</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.product_type || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {log.product_name}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700 font-mono">
                      {log.temp_initial?.toFixed(1)}°
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700 font-mono">
                      {log.temp_2h?.toFixed(1)}°
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700 font-mono">
                      {log.temp_6h?.toFixed(1)}°
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-700">
                      {log.total_duration_hours}t
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                        {getStatusText(log.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.profiles?.full_name || 'Ukjent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
