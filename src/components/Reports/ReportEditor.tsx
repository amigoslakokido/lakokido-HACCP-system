import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save } from 'lucide-react';

interface ReportEditorProps {
  reportDate: string;
  tempLogs: any[];
  cleaningLogs: any[];
  onClose: () => void;
  onSave: () => void;
}

export function ReportEditor({ reportDate, tempLogs, cleaningLogs, onClose, onSave }: ReportEditorProps) {
  const [tempData, setTempData] = useState(tempLogs);
  const [cleaningData, setCleaningData] = useState(cleaningLogs);
  const [saving, setSaving] = useState(false);

  // Update state when props change
  useEffect(() => {
    console.log('📝 Props changed - updating editor state:', {
      tempLogsCount: tempLogs?.length || 0,
      cleaningLogsCount: cleaningLogs?.length || 0
    });
    setTempData(tempLogs);
    setCleaningData(cleaningLogs);
  }, [tempLogs, cleaningLogs]);

  console.log('ReportEditor loaded with:', {
    reportDate,
    tempLogsCount: tempLogs?.length || 0,
    cleaningLogsCount: cleaningLogs?.length || 0,
    tempData: tempData?.length || 0,
    cleaningData: cleaningData?.length || 0
  });

  const updateTempLog = (index: number, field: string, value: any) => {
    console.log(`🔧 updateTempLog called:`, { index, field, value });
    console.log('📊 Current tempData:', tempData);

    if (!tempData || tempData.length === 0) {
      console.error('❌ tempData is empty!');
      return;
    }

    const updated = [...tempData];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'recorded_temp') {
      const zone = updated[index].temperature_items?.temperature_zones;
      if (zone) {
        const temp = parseFloat(value);
        if (temp < zone.min_temp || temp > zone.max_temp) {
          const diff = Math.abs(temp < zone.min_temp ? temp - zone.min_temp : temp - zone.max_temp);
          updated[index].status = diff > 2 ? 'danger' : 'warning';
        } else {
          updated[index].status = 'safe';
        }
        console.log(`Status updated to: ${updated[index].status}`);
      }
    }

    console.log('💾 Setting new tempData');
    setTempData(updated);
    console.log('✅ Updated tempData:', updated);
  };

  const updateCleaningLog = (index: number, field: string, value: any) => {
    console.log(`Updating cleaning log ${index}, field: ${field}, value:`, value);
    const updated = [...cleaningData];
    updated[index] = { ...updated[index], [field]: value };
    setCleaningData(updated);
    console.log('Updated cleaningData:', updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving report changes...');
      console.log('Temperature logs to save:', tempData);
      console.log('Cleaning logs to save:', cleaningData);

      for (const log of tempData) {
        const { error } = await supabase
          .from('temperature_logs')
          .update({
            recorded_temp: log.recorded_temp,
            recorded_time: log.recorded_time,
            status: log.status,
          })
          .eq('id', log.id);

        if (error) {
          console.error('Error updating temp log:', error);
        } else {
          console.log('✓ Updated temp log:', log.id);
        }
      }

      for (const log of cleaningData) {
        const { error } = await supabase
          .from('cleaning_logs')
          .update({
            is_completed: log.is_completed,
            notes: log.notes || '',
            completed_at: log.is_completed ? new Date().toISOString() : null,
          })
          .eq('id', log.id);

        if (error) {
          console.error('Error updating cleaning log:', error);
        } else {
          console.log('✓ Updated cleaning log:', log.id);
        }
      }

      const hasDanger = tempData.some(l => l.status === 'danger');
      const hasWarning = tempData.some(l => l.status === 'warning');
      const overallStatus = hasDanger ? 'danger' : hasWarning ? 'warning' : 'safe';

      console.log('Updating report status to:', overallStatus);

      const { error: reportError } = await supabase
        .from('daily_reports')
        .update({ overall_status: overallStatus })
        .eq('report_date', reportDate);

      if (reportError) {
        console.error('Error updating report status:', reportError);
      } else {
        console.log('✓ Report saved successfully');
      }

      onSave();
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Feil ved lagring av rapport: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Rediger rapport - {reportDate}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Temperaturkontroller</h3>
            {tempData.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                <p>Ingen temperaturkontroller funnet for denne datoen.</p>
                <p className="text-sm mt-1">Denne rapporten har ikke noen temperaturdata å redigere.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tempData.map((log, index) => (
                <div key={log.id} className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-medium text-slate-900 mb-3">
                    {log.temperature_items?.name_no}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Temperatur (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={log.recorded_temp}
                        onChange={(e) => updateTempLog(index, 'recorded_temp', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Tid</label>
                      <input
                        type="time"
                        value={log.recorded_time}
                        onChange={(e) => updateTempLog(index, 'recorded_time', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Status</label>
                      <div className={`px-3 py-2 rounded-lg font-medium text-center ${
                        log.status === 'safe' ? 'bg-emerald-100 text-emerald-700' :
                        log.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status === 'safe' ? 'OK' : log.status === 'warning' ? 'Advarsel' : 'Kritisk'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rengjøringskontroller</h3>
            {cleaningData.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                <p>Ingen rengjøringskontroller funnet for denne datoen.</p>
                <p className="text-sm mt-1">Denne rapporten har ikke noen rengjøringsdata å redigere.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cleaningData.map((log, index) => (
                <div key={log.id} className="bg-slate-50 p-4 rounded-lg">
                  <div className="font-medium text-slate-900 mb-3">
                    {log.cleaning_tasks?.name_no}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Tid</label>
                      <input
                        type="time"
                        value={log.completed_at ? new Date(log.completed_at).toTimeString().slice(0, 5) : ''}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const date = log.log_date || new Date().toISOString().split('T')[0];
                          updateCleaningLog(index, 'completed_at', `${date}T${newTime}:00`);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Status</label>
                      <select
                        value={log.is_completed ? 'true' : 'false'}
                        onChange={(e) => updateCleaningLog(index, 'is_completed', e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="true">Fullført</option>
                        <option value="false">Ikke utført</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Notat</label>
                      <input
                        type="text"
                        value={log.notes || ''}
                        onChange={(e) => updateCleaningLog(index, 'notes', e.target.value)}
                        placeholder="Legg til notat..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Lagrer...' : 'Lagre endringer'}
          </button>
        </div>
      </div>
    </div>
  );
}
