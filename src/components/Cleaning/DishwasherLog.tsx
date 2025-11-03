import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Droplets, Plus, Calendar, Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface DishwasherLog {
  id: string;
  log_date: string;
  log_time: string;
  wash_temp: number;
  dry_temp: number;
  status: string;
  notes: string;
  recorded_by: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
  };
}

export default function DishwasherLog() {
  const defaultUserId = 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5';
  const [logs, setLogs] = useState<DishwasherLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    log_time: new Date().toTimeString().slice(0, 5),
    wash_temp: '',
    dry_temp: '',
    notes: ''
  });

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dishwasher_logs')
      .select('*, profiles:recorded_by(id, full_name)')
      .eq('log_date', selectedDate)
      .order('log_time', { ascending: false });

    console.log('Dishwasher logs data:', data);
    console.log('Dishwasher logs error:', error);

    if (data) setLogs(data as any);
    setLoading(false);
  };

  const calculateStatus = (washTemp: number, dryTemp: number): string => {
    const washOk = washTemp >= 55 && washTemp <= 70;
    const dryOk = dryTemp >= 75 && dryTemp <= 90;

    if (washOk && dryOk) return 'OK';
    if (!washOk && !dryOk) return 'Kritisk';
    return 'Advarsel';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const washTemp = parseFloat(formData.wash_temp);
    const dryTemp = parseFloat(formData.dry_temp);
    const status = calculateStatus(washTemp, dryTemp);

    const { error } = await supabase
      .from('dishwasher_logs')
      .insert({
        log_date: selectedDate,
        log_time: formData.log_time,
        wash_temp: washTemp,
        dry_temp: dryTemp,
        status,
        notes: formData.notes,
        recorded_by: defaultUserId
      });

    if (!error) {
      setShowForm(false);
      setFormData({
        log_time: new Date().toTimeString().slice(0, 5),
        wash_temp: '',
        dry_temp: '',
        notes: ''
      });
      loadLogs();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Advarsel':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'Kritisk':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Advarsel':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Kritisk':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTempColor = (temp: number, type: 'wash' | 'dry') => {
    if (type === 'wash') {
      if (temp >= 55 && temp <= 70) return 'text-green-700 font-semibold';
      return 'text-red-700 font-semibold';
    } else {
      if (temp >= 75 && temp <= 90) return 'text-green-700 font-semibold';
      return 'text-red-700 font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Oppvaskmaskin</h2>
            <p className="text-sm text-slate-600">Temperaturkontroll for oppvaskmaskinen</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ny Måling
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Velg dato
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Registrer ny temperaturmåling</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Tidspunkt
              </label>
              <input
                type="time"
                value={formData.log_time}
                onChange={(e) => setFormData({ ...formData, log_time: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vasktemperatur (55-70°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.wash_temp}
                  onChange={(e) => setFormData({ ...formData, wash_temp: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="60.0"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Normal: 55-70°C</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tørktemperatur (75-90°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.dry_temp}
                  onChange={(e) => setFormData({ ...formData, dry_temp: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80.0"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Normal: 75-90°C</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Merknader
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Valgfri merknader..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lagre Måling
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">Målinger - {new Date(selectedDate).toLocaleDateString('nb-NO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Laster...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Ingen målinger registrert for denne datoen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Tid</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Vasktemp (°C)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Tørktemp (°C)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Merknader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Registrert av</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {log.log_time.slice(0, 5)}
                    </td>
                    <td className={`px-6 py-4 text-center text-sm font-mono ${getTempColor(log.wash_temp, 'wash')}`}>
                      {log.wash_temp?.toFixed(1)}°
                    </td>
                    <td className={`px-6 py-4 text-center text-sm font-mono ${getTempColor(log.dry_temp, 'dry')}`}>
                      {log.dry_temp?.toFixed(1)}°
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.notes || '-'}
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Temperaturkrav
        </h3>
        <div className="space-y-1 text-sm text-blue-800">
          <p><strong>Vasktemperatur:</strong> 55-70°C</p>
          <p><strong>Tørktemperatur:</strong> 75-90°C</p>
          <p className="text-xs text-blue-600 mt-2">Temperaturer utenfor disse områdene markeres automatisk som avvik.</p>
        </div>
      </div>
    </div>
  );
}
