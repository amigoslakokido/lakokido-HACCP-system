import { useState, useEffect } from 'react';
import { supabase, TemperatureZone, TemperatureItem, TemperatureLog } from '../../lib/supabase';
import { Thermometer, Plus, Save, Edit2, Trash2, AlertTriangle, Snowflake } from 'lucide-react';
import CoolingLog from '../Cooling/CoolingLog';

export function TemperatureControl() {
  const [activeTab, setActiveTab] = useState<'temperature' | 'cooling'>('temperature');
  const [zones, setZones] = useState<(TemperatureZone & { items: TemperatureItem[] })[]>([]);
  const [logs, setLogs] = useState<Record<string, TemperatureLog>>({});
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [temperatures, setTemperatures] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: zonesData, error: zonesError } = await supabase
        .from('temperature_zones')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      console.log('Zones data:', zonesData, 'Error:', zonesError);

      if (zonesData) {
        const zonesWithItems = await Promise.all(
          zonesData.map(async (zone) => {
            const { data: items, error: itemsError } = await supabase
              .from('temperature_items')
              .select('*')
              .eq('zone_id', zone.id)
              .eq('is_active', true)
              .order('sort_order');

            console.log(`Items for zone ${zone.name_no}:`, items, 'Error:', itemsError);

            return { ...zone, items: items || [] };
          })
        );

        console.log('Final zones with items:', zonesWithItems);
        setZones(zonesWithItems);

        const today = new Date().toISOString().split('T')[0];
        const { data: logsData } = await supabase
          .from('temperature_logs')
          .select('*')
          .eq('recorded_date', today);

        if (logsData) {
          const logsMap: Record<string, TemperatureLog> = {};
          // Keep only the most recent log per item
          logsData.forEach((log) => {
            const existingLog = logsMap[log.item_id];
            if (!existingLog || new Date(log.created_at) > new Date(existingLog.created_at)) {
              logsMap[log.item_id] = log;
            }
          });
          setLogs(logsMap);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (temp: number, min: number, max: number): 'safe' | 'warning' | 'danger' => {
    if (temp >= min && temp <= max) return 'safe';
    if (temp >= min - 2 && temp <= max + 2) return 'warning';
    return 'danger';
  };

  const saveTemperature = async (itemId: string, zoneId: string) => {
    const temp = parseFloat(temperatures[itemId]);
    if (isNaN(temp)) return;

    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    const status = calculateStatus(temp, zone.min_temp, zone.max_temp);
    const today = new Date().toISOString().split('T')[0];

    try {
      const existingLog = logs[itemId];

      if (existingLog) {
        // Update existing log for today
        const { data } = await supabase
          .from('temperature_logs')
          .update({
            recorded_temp: temp,
            status,
          })
          .eq('id', existingLog.id)
          .select()
          .single();

        if (data) {
          setLogs({ ...logs, [itemId]: data });
        }
      } else {
        // Check if a log already exists for this item today
        const { data: checkData } = await supabase
          .from('temperature_logs')
          .select('*')
          .eq('item_id', itemId)
          .eq('recorded_date', today)
          .maybeSingle();

        if (checkData) {
          // Log already exists, update it instead
          const { data } = await supabase
            .from('temperature_logs')
            .update({
              recorded_temp: temp,
              status,
            })
            .eq('id', checkData.id)
            .select()
            .single();

          if (data) {
            setLogs({ ...logs, [itemId]: data });
          }
        } else {
          // Insert new log
          const { data } = await supabase
            .from('temperature_logs')
            .insert({
              item_id: itemId,
              recorded_temp: temp,
              status,
              recorded_by: '00000000-0000-0000-0000-000000000000',
              recorded_date: today,
            })
            .select()
            .single();

          if (data) {
            setLogs({ ...logs, [itemId]: data });
          }
        }
      }

      setEditingItem(null);
      setTemperatures({ ...temperatures, [itemId]: '' });
    } catch (error) {
      console.error('Error saving temperature:', error);
      alert('حدث خطأ أثناء الحفظ. القياس موجود بالفعل لهذا اليوم.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'danger': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'warning' || status === 'danger') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Laster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
          <Thermometer className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Temperaturkontroll</h2>
          <p className="text-slate-600">Registrer og overvåk temperaturer</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('temperature')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'temperature'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Thermometer className="w-5 h-5" />
          Temperaturlogg
        </button>
        <button
          onClick={() => setActiveTab('cooling')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'cooling'
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Snowflake className="w-5 h-5" />
          Nedkjølingslogg
        </button>
      </div>

      {activeTab === 'cooling' ? (
        <CoolingLog />
      ) : (
        <>

      {zones.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-900 mb-2">Ingen temperatursoner funnet</h3>
          <p className="text-amber-700">
            Sjekk konsollen (F12) for feilmeldinger eller gå til Innstillinger for å legge til soner.
          </p>
        </div>
      )}

      {zones.map((zone) => (
        <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">{zone.name_no}</h3>
            <p className="text-sm text-slate-600">
              Trygt område: {zone.min_temp}°C til {zone.max_temp}°C
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {zone.items.map((item) => {
                const log = logs[item.id];
                const isEditing = editingItem === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      log ? getStatusColor(log.status) : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium text-slate-900">{item.name_no}</span>
                        {log && getStatusIcon(log.status)}
                      </div>

                      {log && !isEditing && (
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold">
                            {log.recorded_temp}°C
                          </span>
                          <button
                            onClick={() => {
                              setEditingItem(item.id);
                              setTemperatures({ ...temperatures, [item.id]: log.recorded_temp.toString() });
                            }}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {(!log || isEditing) && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            value={temperatures[item.id] || ''}
                            onChange={(e) => setTemperatures({ ...temperatures, [item.id]: e.target.value })}
                            placeholder="°C"
                            className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => saveTemperature(item.id, zone.id)}
                            disabled={!temperatures[item.id]}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Lagre
                          </button>
                        </div>
                      )}
                    </div>

                    {log && (
                      <div className="mt-2 text-xs text-slate-600">
                        Registrert: {new Date(log.created_at).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
        </>
      )}
    </div>
  );
}
