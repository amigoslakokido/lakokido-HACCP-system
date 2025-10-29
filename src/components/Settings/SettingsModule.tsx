import { useState, useEffect } from 'react';
import { supabase, TemperatureZone, TemperatureItem, CleaningTask, Profile } from '../../lib/supabase';
import { Settings, Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react';

export function SettingsModule() {
  const [zones, setZones] = useState<(TemperatureZone & { items: TemperatureItem[] })[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editingZoneName, setEditingZoneName] = useState('');
  const [editingZoneMinTemp, setEditingZoneMinTemp] = useState('');
  const [editingZoneMaxTemp, setEditingZoneMaxTemp] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newItemZoneId, setNewItemZoneId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'staff' | 'supervisor' | 'admin'>('staff');
  const [autoReportEnabled, setAutoReportEnabled] = useState(false);
  const [savingAutoReport, setSavingAutoReport] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskFrequency, setNewTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: zonesData, error: zonesError } = await supabase
        .from('temperature_zones')
        .select('*')
        .order('sort_order');

      console.log('Settings - Zones data:', zonesData, 'Error:', zonesError);

      if (zonesData) {
        const zonesWithItems = await Promise.all(
          zonesData.map(async (zone) => {
            const { data: items, error: itemsError } = await supabase
              .from('temperature_items')
              .select('*')
              .eq('zone_id', zone.id)
              .order('sort_order');

            console.log(`Settings - Items for zone ${zone.name_no}:`, items, 'Error:', itemsError);

            return { ...zone, items: items || [] };
          })
        );

        console.log('Settings - Final zones:', zonesWithItems);
        setZones(zonesWithItems);
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .order('sort_order');

      console.log('Settings - Tasks data:', tasksData, 'Error:', tasksError);

      if (tasksData) {
        setTasks(tasksData);
      }

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at');

      console.log('Settings - Users data:', usersData, 'Error:', usersError);

      if (usersData) {
        setUsers(usersData);
      }

      const { data: autoReportSettings } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'auto_generate_daily_report')
        .single();

      if (autoReportSettings) {
        setAutoReportEnabled(autoReportSettings.setting_value?.enabled || false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateZone = async (zoneId: string) => {
    try {
      const minTemp = parseFloat(editingZoneMinTemp);
      const maxTemp = parseFloat(editingZoneMaxTemp);

      if (isNaN(minTemp) || isNaN(maxTemp)) {
        alert('Vennligst skriv inn gyldige temperaturer');
        return;
      }

      if (minTemp >= maxTemp) {
        alert('Minimum temperatur må være lavere enn maksimum temperatur');
        return;
      }

      const { data } = await supabase
        .from('temperature_zones')
        .update({
          name_no: editingZoneName,
          min_temp: minTemp,
          max_temp: maxTemp,
        })
        .eq('id', zoneId)
        .select()
        .single();

      if (data) {
        setZones(zones.map(z => z.id === zoneId ? { ...z, ...data } : z));
        setEditingZone(null);
        setEditingZoneName('');
        setEditingZoneMinTemp('');
        setEditingZoneMaxTemp('');
      }
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  const deleteZone = async (zoneId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne sonen? Alle elementer vil også bli slettet.')) return;

    try {
      await supabase.from('temperature_zones').delete().eq('id', zoneId);
      setZones(zones.filter(z => z.id !== zoneId));
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const addItem = async (zoneId: string) => {
    if (!newItemName.trim()) {
      alert('Vennligst skriv inn et navn for elementet');
      return;
    }

    try {
      const { data } = await supabase
        .from('temperature_items')
        .insert({
          zone_id: zoneId,
          name_no: newItemName,
          sort_order: zones.find(z => z.id === zoneId)?.items.length || 0,
        })
        .select()
        .single();

      if (data) {
        setZones(zones.map(z =>
          z.id === zoneId ? { ...z, items: [...z.items, data] } : z
        ));
        setNewItemZoneId(null);
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (itemId: string, name: string) => {
    try {
      const { data } = await supabase
        .from('temperature_items')
        .update({ name_no: name })
        .eq('id', itemId)
        .select()
        .single();

      if (data) {
        setZones(zones.map(z => ({
          ...z,
          items: z.items.map(i => i.id === itemId ? data : i)
        })));
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId: string, zoneId: string) => {
    if (!confirm('Er du sikker på at du vil slette dette elementet?')) return;

    try {
      await supabase.from('temperature_items').delete().eq('id', itemId);
      setZones(zones.map(z =>
        z.id === zoneId ? { ...z, items: z.items.filter(i => i.id !== itemId) } : z
      ));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const updateTask = async (taskId: string, name: string) => {
    try {
      const { data } = await supabase
        .from('cleaning_tasks')
        .update({ name_no: name })
        .eq('id', taskId)
        .select()
        .single();

      if (data) {
        setTasks(tasks.map(t => t.id === taskId ? data : t));
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleTaskActive = async (taskId: string, isActive: boolean) => {
    try {
      const { data } = await supabase
        .from('cleaning_tasks')
        .update({ is_active: !isActive })
        .eq('id', taskId)
        .select()
        .single();

      if (data) {
        setTasks(tasks.map(t => t.id === taskId ? data : t));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne oppgaven? Alle tilhørende logger vil også bli slettet.')) return;

    try {
      await supabase.from('cleaning_tasks').delete().eq('id', taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Kunne ikke slette oppgave');
    }
  };

  const addTask = async () => {
    if (!newTaskName.trim()) {
      alert('Vennligst skriv inn et navn for oppgaven');
      return;
    }

    try {
      const { data } = await supabase
        .from('cleaning_tasks')
        .insert({
          name_no: newTaskName,
          description: newTaskDescription,
          frequency: newTaskFrequency,
          is_active: true,
          sort_order: tasks.length,
        })
        .select()
        .single();

      if (data) {
        setTasks([...tasks, data]);
        setAddingTask(false);
        setNewTaskName('');
        setNewTaskDescription('');
        setNewTaskFrequency('daily');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Kunne ikke legge til oppgave');
    }
  };

  const toggleAutoReport = async (enabled: boolean) => {
    setSavingAutoReport(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: { enabled, generation_time: '23:00' }
        })
        .eq('setting_key', 'auto_generate_daily_report');

      if (!error) {
        setAutoReportEnabled(enabled);
      }
    } catch (error) {
      console.error('Error updating auto-report setting:', error);
    } finally {
      setSavingAutoReport(false);
    }
  };

  const addUser = async () => {
    if (!newUserName.trim()) {
      alert('Vennligst skriv inn et navn');
      return;
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .insert({
          full_name: newUserName,
          role: newUserRole,
        })
        .select()
        .single();

      if (data) {
        setUsers([...users, data]);
        setAddingUser(false);
        setNewUserName('');
        setNewUserRole('staff');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Kunne ikke legge til bruker');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne brukeren?')) return;

    try {
      await supabase.from('profiles').delete().eq('id', userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kunne ikke slette bruker');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (data) {
        setUsers(users.map(u => u.id === userId ? data : u));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
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
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Systeminnstillinger</h2>
          <p className="text-slate-600">Administrer temperatursoner, oppgaver og brukere</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-violet-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Automatisk Daglig Rapport</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-900 mb-1">Aktiver automatisk rapportgenerering</h4>
              <p className="text-sm text-slate-600">
                Systemet vil automatisk generere en daglig rapport kl. 23:00 hvis ingen manuell rapport er opprettet
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={autoReportEnabled}
                onChange={(e) => toggleAutoReport(e.target.checked)}
                disabled={savingAutoReport}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
          {savingAutoReport && (
            <div className="mt-3 text-sm text-slate-600">Lagrer...</div>
          )}
          {autoReportEnabled && (
            <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <p className="text-sm text-violet-900">
                <strong>Aktivert:</strong> Daglige rapporter vil genereres automatisk hver kveld kl. 23:00
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-blue-900">Temperatursoner og elementer</h3>
        </div>
        <div className="p-6 space-y-6">
          {zones.map((zone) => (
            <div key={zone.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3">
                {editingZone === zone.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700 w-24">Navn:</label>
                      <input
                        type="text"
                        value={editingZoneName}
                        onChange={(e) => setEditingZoneName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Sone navn"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700 w-24">Min temp:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingZoneMinTemp}
                        onChange={(e) => setEditingZoneMinTemp(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="°C"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-700 w-24">Maks temp:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingZoneMaxTemp}
                        onChange={(e) => setEditingZoneMaxTemp(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="°C"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingZone(null);
                          setEditingZoneName('');
                          setEditingZoneMinTemp('');
                          setEditingZoneMaxTemp('');
                        }}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Avbryt
                      </button>
                      <button
                        onClick={() => updateZone(zone.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Lagre
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg">{zone.name_no}</span>
                      <span className="text-sm text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                        {zone.min_temp}°C - {zone.max_temp}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingZone(zone.id);
                          setEditingZoneName(zone.name_no);
                          setEditingZoneMinTemp(zone.min_temp.toString());
                          setEditingZoneMaxTemp(zone.max_temp.toString());
                        }}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Rediger sone"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteZone(zone.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Slett sone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                {zone.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          defaultValue={item.name_no}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateItem(item.id, e.currentTarget.value);
                            }
                          }}
                          className="px-3 py-1 border border-slate-300 rounded flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingItem(null)}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-slate-700">{item.name_no}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingItem(item.id)}
                            className="p-1 hover:bg-slate-200 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id, zone.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {newItemZoneId === zone.id ? (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Nytt element navn"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addItem(zone.id);
                        }
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setNewItemZoneId(null);
                        setNewItemName('');
                      }}
                      className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addItem(zone.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Legg til
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewItemZoneId(zone.id)}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Legg til nytt element
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-cyan-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-cyan-900">Rengjøringsoppgaver</h3>
          {!addingTask && (
            <button
              onClick={() => setAddingTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ny oppgave
            </button>
          )}
        </div>
        <div className="p-6">
          {addingTask && (
            <div className="mb-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Oppgavenavn</label>
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="F.eks. Vaske gulv"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Beskrivelse (valgfri)</label>
                  <input
                    type="text"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Kort beskrivelse av oppgaven"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frekvens</label>
                  <select
                    value={newTaskFrequency}
                    onChange={(e) => setNewTaskFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="daily">Daglig</option>
                    <option value="weekly">Ukentlig</option>
                    <option value="monthly">Månedlig</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      setAddingTask(false);
                      setNewTaskName('');
                      setNewTaskDescription('');
                      setNewTaskFrequency('daily');
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={addTask}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Legg til
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                {editingTask === task.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      defaultValue={task.name_no}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateTask(task.id, e.currentTarget.value);
                        }
                      }}
                      className="px-3 py-2 border border-slate-300 rounded flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingTask(null)}
                      className="p-2 hover:bg-slate-200 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <span className={task.is_active ? 'text-slate-900' : 'text-slate-400 line-through'}>
                        {task.name_no}
                      </span>
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                        {task.frequency === 'daily' ? 'Daglig' : task.frequency === 'weekly' ? 'Ukentlig' : 'Månedlig'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTaskActive(task.id, task.is_active)}
                        className={`px-3 py-1 rounded text-sm ${
                          task.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.is_active ? 'Aktiv' : 'Inaktiv'}
                      </button>
                      <button
                        onClick={() => setEditingTask(task.id)}
                        className="p-2 hover:bg-slate-200 rounded"
                        title="Rediger oppgave"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Slett oppgave"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Brukeradministrasjon
          </h3>
          {!addingUser && (
            <button
              onClick={() => setAddingUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Legg til bruker
            </button>
          )}
        </div>
        <div className="p-6">
          {addingUser && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fullt navn</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Skriv inn fullt navn"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rolle</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'staff' | 'supervisor' | 'admin')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="staff">Medarbeider</option>
                    <option value="supervisor">Veileder</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      setAddingUser(false);
                      setNewUserName('');
                      setNewUserRole('staff');
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={addUser}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Legg til
                  </button>
                </div>
              </div>
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>Ingen brukere ennå</p>
              <p className="text-sm">Klikk "Legg til bruker" for å komme i gang</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{user.full_name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Opprettet: {new Date(user.created_at).toLocaleDateString('nb-NO')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="staff">Medarbeider</option>
                      <option value="supervisor">Veileder</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Slett bruker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
