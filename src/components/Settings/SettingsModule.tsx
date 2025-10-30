import { useState, useEffect } from 'react';
import { supabase, Zone, Equipment, CleaningTask, Employee } from '../../lib/supabase';
import { Settings, Plus, Edit2, Trash2, Save, X, Users, Thermometer, Briefcase } from 'lucide-react';

export function SettingsModule() {
  const [zones, setZones] = useState<(Zone & { equipment: Equipment[] })[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [addingZone, setAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDescription, setNewZoneDescription] = useState('');

  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editingZoneName, setEditingZoneName] = useState('');
  const [editingZoneDescription, setEditingZoneDescription] = useState('');

  const [addingEquipment, setAddingEquipment] = useState<string | null>(null);
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newEquipmentType, setNewEquipmentType] = useState<'refrigerator' | 'freezer' | 'other'>('refrigerator');
  const [newEquipmentMinTemp, setNewEquipmentMinTemp] = useState('-18');
  const [newEquipmentMaxTemp, setNewEquipmentMaxTemp] = useState('4');

  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [editingEquipmentName, setEditingEquipmentName] = useState('');
  const [editingEquipmentType, setEditingEquipmentType] = useState<'refrigerator' | 'freezer' | 'other'>('refrigerator');
  const [editingEquipmentMinTemp, setEditingEquipmentMinTemp] = useState('');
  const [editingEquipmentMaxTemp, setEditingEquipmentMaxTemp] = useState('');

  const [addingEmployee, setAddingEmployee] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<'daglig_leder' | 'kontrollor' | 'medarbeider'>('medarbeider');

  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [editingEmployeeName, setEditingEmployeeName] = useState('');
  const [editingEmployeeRole, setEditingEmployeeRole] = useState<'daglig_leder' | 'kontrollor' | 'medarbeider'>('medarbeider');
  const [editingEmployeeStatus, setEditingEmployeeStatus] = useState<'active' | 'paused'>('active');

  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskFrequency, setNewTaskFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newTaskZoneId, setNewTaskZoneId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: zonesData } = await supabase
        .from('zones')
        .select('*')
        .order('name');

      if (zonesData) {
        const zonesWithEquipment = await Promise.all(
          zonesData.map(async (zone) => {
            const { data: equipmentItems } = await supabase
              .from('equipment')
              .select('*')
              .eq('zone_id', zone.id)
              .order('name');

            return { ...zone, equipment: equipmentItems || [] };
          })
        );

        setZones(zonesWithEquipment);
      }

      const { data: tasksData } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .order('task_name');

      if (tasksData) {
        setTasks(tasksData);
      }

      const { data: employeesData } = await supabase
        .from('employees')
        .select('*')
        .order('role', { ascending: false })
        .order('name');

      if (employeesData) {
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addZone = async () => {
    if (!newZoneName.trim()) {
      alert('Vennligst skriv inn et navn for sonen');
      return;
    }

    try {
      const { data } = await supabase
        .from('zones')
        .insert({
          name: newZoneName,
          description: newZoneDescription,
        })
        .select()
        .single();

      if (data) {
        setZones([...zones, { ...data, equipment: [] }]);
        setAddingZone(false);
        setNewZoneName('');
        setNewZoneDescription('');
      }
    } catch (error) {
      console.error('Error adding zone:', error);
      alert('Det oppstod en feil ved opprettelse av sone');
    }
  };

  const updateZone = async (zoneId: string) => {
    if (!editingZoneName.trim()) {
      alert('Vennligst skriv inn et navn for sonen');
      return;
    }

    try {
      const { data } = await supabase
        .from('zones')
        .update({
          name: editingZoneName,
          description: editingZoneDescription,
        })
        .eq('id', zoneId)
        .select()
        .single();

      if (data) {
        setZones(zones.map(z => z.id === zoneId ? { ...z, ...data } : z));
        setEditingZone(null);
        setEditingZoneName('');
        setEditingZoneDescription('');
      }
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  const deleteZone = async (zoneId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne sonen?')) return;

    try {
      await supabase.from('zones').delete().eq('id', zoneId);
      setZones(zones.filter(z => z.id !== zoneId));
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const addEquipment = async (zoneId: string) => {
    if (!newEquipmentName.trim()) {
      alert('Vennligst skriv inn et navn for utstyret');
      return;
    }

    const minTemp = parseFloat(newEquipmentMinTemp);
    const maxTemp = parseFloat(newEquipmentMaxTemp);

    if (isNaN(minTemp) || isNaN(maxTemp)) {
      alert('Vennligst skriv inn gyldige temperaturer');
      return;
    }

    try {
      const { data } = await supabase
        .from('equipment')
        .insert({
          name: newEquipmentName,
          type: newEquipmentType,
          zone_id: zoneId,
          min_temp: minTemp,
          max_temp: maxTemp,
          active: true,
        })
        .select()
        .single();

      if (data) {
        setZones(zones.map(z =>
          z.id === zoneId
            ? { ...z, equipment: [...z.equipment, data] }
            : z
        ));
        setAddingEquipment(null);
        setNewEquipmentName('');
        setNewEquipmentType('refrigerator');
        setNewEquipmentMinTemp('-18');
        setNewEquipmentMaxTemp('4');
      }
    } catch (error) {
      console.error('Error adding equipment:', error);
      alert('Det oppstod en feil ved opprettelse av utstyr');
    }
  };

  const updateEquipment = async (equipmentId: string, zoneId: string) => {
    if (!editingEquipmentName.trim()) {
      alert('Vennligst skriv inn et navn for utstyret');
      return;
    }

    const minTemp = parseFloat(editingEquipmentMinTemp);
    const maxTemp = parseFloat(editingEquipmentMaxTemp);

    if (isNaN(minTemp) || isNaN(maxTemp)) {
      alert('Vennligst skriv inn gyldige temperaturer');
      return;
    }

    try {
      const { data } = await supabase
        .from('equipment')
        .update({
          name: editingEquipmentName,
          type: editingEquipmentType,
          min_temp: minTemp,
          max_temp: maxTemp,
        })
        .eq('id', equipmentId)
        .select()
        .single();

      if (data) {
        setZones(zones.map(z =>
          z.id === zoneId
            ? { ...z, equipment: z.equipment.map(e => e.id === equipmentId ? data : e) }
            : z
        ));
        setEditingEquipment(null);
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  const deleteEquipment = async (equipmentId: string, zoneId: string) => {
    if (!confirm('Er du sikker på at du vil slette dette utstyret?')) return;

    try {
      await supabase.from('equipment').delete().eq('id', equipmentId);
      setZones(zones.map(z =>
        z.id === zoneId
          ? { ...z, equipment: z.equipment.filter(e => e.id !== equipmentId) }
          : z
      ));
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const addEmployee = async () => {
    if (!newEmployeeName.trim()) {
      alert('Vennligst skriv inn et navn for ansatt');
      return;
    }

    try {
      const { data } = await supabase
        .from('employees')
        .insert({
          name: newEmployeeName,
          role: newEmployeeRole,
          status: 'active',
          active: true,
        })
        .select()
        .single();

      if (data) {
        setEmployees([...employees, data]);
        setAddingEmployee(false);
        setNewEmployeeName('');
        setNewEmployeeRole('medarbeider');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Det oppstod en feil ved opprettelse av ansatt');
    }
  };

  const startEditingEmployee = (employee: Employee) => {
    setEditingEmployee(employee.id);
    setEditingEmployeeName(employee.name);
    setEditingEmployeeRole(employee.role as 'daglig_leder' | 'kontrollor' | 'medarbeider');
    setEditingEmployeeStatus(employee.status as 'active' | 'paused');
  };

  const saveEmployee = async () => {
    if (!editingEmployee || !editingEmployeeName.trim()) return;

    try {
      const { data } = await supabase
        .from('employees')
        .update({
          name: editingEmployeeName,
          role: editingEmployeeRole,
          status: editingEmployeeStatus,
        })
        .eq('id', editingEmployee)
        .select()
        .single();

      if (data) {
        setEmployees(employees.map(e => e.id === editingEmployee ? data : e));
        setEditingEmployee(null);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Det oppstod en feil ved oppdatering av ansatt');
    }
  };

  const toggleEmployeeStatus = async (employeeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const confirmMsg = newStatus === 'paused'
      ? 'Er du sikker på at du vil pause denne ansatte? Ansatte vil fortsatt vises i tidligere rapporter.'
      : 'Vil du aktivere denne ansatte igjen?';

    if (!confirm(confirmMsg)) return;

    try {
      const { data } = await supabase
        .from('employees')
        .update({ status: newStatus })
        .eq('id', employeeId)
        .select()
        .single();

      if (data) {
        setEmployees(employees.map(e => e.id === employeeId ? data : e));
      }
    } catch (error) {
      console.error('Error toggling employee status:', error);
      alert('Det oppstod en feil ved endring av status');
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne ansatte? Ansatte vil fortsatt vises i tidligere rapporter.')) return;

    try {
      await supabase.from('employees').delete().eq('id', employeeId);
      setEmployees(employees.filter(e => e.id !== employeeId));
    } catch (error) {
      console.error('Error deleting employee:', error);
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
          task_name: newTaskName,
          description: newTaskDescription,
          frequency: newTaskFrequency,
          zone_id: newTaskZoneId || null,
          active: true,
        })
        .select()
        .single();

      if (data) {
        setTasks([...tasks, data]);
        setAddingTask(false);
        setNewTaskName('');
        setNewTaskDescription('');
        setNewTaskFrequency('daily');
        setNewTaskZoneId('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Det oppstod en feil ved opprettelse av oppgave');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne oppgaven?')) return;

    try {
      await supabase.from('cleaning_tasks').delete().eq('id', taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Innstillinger</h2>
          <p className="text-slate-600">Administrer soner, utstyr og ansatte</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Soner og Utstyr</h3>
          </div>
          <button
            onClick={() => setAddingZone(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Legg til sone
          </button>
        </div>

        <div className="p-6 space-y-4">
          {addingZone && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Ny sone</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Sonenavn (f.eks. Kjøkken, Lager)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newZoneDescription}
                  onChange={(e) => setNewZoneDescription(e.target.value)}
                  placeholder="Beskrivelse (valgfritt)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addZone}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                  <button
                    onClick={() => {
                      setAddingZone(false);
                      setNewZoneName('');
                      setNewZoneDescription('');
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}

          {zones.length === 0 && !addingZone && (
            <div className="text-center py-8 text-slate-500">
              Ingen soner ennå. Klikk "Legg til sone" for å komme i gang.
            </div>
          )}

          {zones.map((zone) => (
            <div key={zone.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                {editingZone === zone.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingZoneName}
                      onChange={(e) => setEditingZoneName(e.target.value)}
                      className="flex-1 px-3 py-1 border border-slate-300 rounded"
                    />
                    <input
                      type="text"
                      value={editingZoneDescription}
                      onChange={(e) => setEditingZoneDescription(e.target.value)}
                      placeholder="Beskrivelse"
                      className="flex-1 px-3 py-1 border border-slate-300 rounded"
                    />
                    <button
                      onClick={() => updateZone(zone.id)}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingZone(null)}
                      className="p-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="font-semibold text-slate-900">{zone.name}</h4>
                      {zone.description && (
                        <p className="text-sm text-slate-600">{zone.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAddingEquipment(zone.id)}
                        className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Utstyr
                      </button>
                      <button
                        onClick={() => {
                          setEditingZone(zone.id);
                          setEditingZoneName(zone.name);
                          setEditingZoneDescription(zone.description);
                        }}
                        className="p-2 hover:bg-slate-200 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => deleteZone(zone.id)}
                        className="p-2 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 space-y-2">
                {addingEquipment === zone.id && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-2">
                    <h5 className="font-semibold text-slate-900 mb-2 text-sm">Nytt utstyr</h5>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newEquipmentName}
                        onChange={(e) => setNewEquipmentName(e.target.value)}
                        placeholder="Utstyrsnavn (f.eks. Kjøleskap 1)"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                      />
                      <select
                        value={newEquipmentType}
                        onChange={(e) => setNewEquipmentType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                      >
                        <option value="refrigerator">Kjøleskap</option>
                        <option value="freezer">Fryser</option>
                        <option value="other">Annet</option>
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={newEquipmentMinTemp}
                          onChange={(e) => setNewEquipmentMinTemp(e.target.value)}
                          placeholder="Min temp (°C)"
                          className="px-3 py-2 border border-slate-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={newEquipmentMaxTemp}
                          onChange={(e) => setNewEquipmentMaxTemp(e.target.value)}
                          placeholder="Max temp (°C)"
                          className="px-3 py-2 border border-slate-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addEquipment(zone.id)}
                          className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
                        >
                          Lagre
                        </button>
                        <button
                          onClick={() => {
                            setAddingEquipment(null);
                            setNewEquipmentName('');
                            setNewEquipmentType('refrigerator');
                            setNewEquipmentMinTemp('-18');
                            setNewEquipmentMaxTemp('4');
                          }}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {zone.equipment.length === 0 && addingEquipment !== zone.id && (
                  <div className="text-sm text-slate-500 text-center py-2">
                    Ingen utstyr i denne sonen
                  </div>
                )}

                {zone.equipment.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                    {editingEquipment === equipment.id ? (
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={editingEquipmentName}
                          onChange={(e) => setEditingEquipmentName(e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-sm"
                        />
                        <select
                          value={editingEquipmentType}
                          onChange={(e) => setEditingEquipmentType(e.target.value as any)}
                          className="px-2 py-1 border border-slate-300 rounded text-sm"
                        >
                          <option value="refrigerator">Kjøleskap</option>
                          <option value="freezer">Fryser</option>
                          <option value="other">Annet</option>
                        </select>
                        <input
                          type="number"
                          step="0.1"
                          value={editingEquipmentMinTemp}
                          onChange={(e) => setEditingEquipmentMinTemp(e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={editingEquipmentMaxTemp}
                          onChange={(e) => setEditingEquipmentMaxTemp(e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 text-sm">{equipment.name}</div>
                        <div className="text-xs text-slate-600">
                          {equipment.type === 'refrigerator' ? 'Kjøleskap' : equipment.type === 'freezer' ? 'Fryser' : 'Annet'} -
                          {' '}{equipment.min_temp}°C til {equipment.max_temp}°C
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {editingEquipment === equipment.id ? (
                        <>
                          <button
                            onClick={() => updateEquipment(equipment.id, zone.id)}
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingEquipment(null)}
                            className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingEquipment(equipment.id);
                              setEditingEquipmentName(equipment.name);
                              setEditingEquipmentType(equipment.type);
                              setEditingEquipmentMinTemp(equipment.min_temp.toString());
                              setEditingEquipmentMaxTemp(equipment.max_temp.toString());
                            }}
                            className="p-1 hover:bg-slate-200 rounded"
                          >
                            <Edit2 className="w-3 h-3 text-slate-600" />
                          </button>
                          <button
                            onClick={() => deleteEquipment(equipment.id, zone.id)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Ansatte</h3>
          </div>
          <button
            onClick={() => setAddingEmployee(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Legg til ansatt
          </button>
        </div>

        <div className="p-6 space-y-3">
          {addingEmployee && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-slate-900 mb-3">Ny ansatt</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  placeholder="Navn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <select
                  value={newEmployeeRole}
                  onChange={(e) => setNewEmployeeRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="medarbeider">Medarbeider</option>
                  <option value="kontrollor">Kontrollør</option>
                  <option value="daglig_leder">Daglig leder</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={addEmployee}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Lagre
                  </button>
                  <button
                    onClick={() => {
                      setAddingEmployee(false);
                      setNewEmployeeName('');
                      setNewEmployeeRole('medarbeider');
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}

          {employees.length === 0 && !addingEmployee && (
            <div className="text-center py-8 text-slate-500">
              Ingen ansatte ennå. Klikk "Legg til ansatt" for å komme i gang.
            </div>
          )}

          {employees.map((employee) => (
            <div key={employee.id} className="bg-slate-50 p-4 rounded-lg">
              {editingEmployee === employee.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingEmployeeName}
                    onChange={(e) => setEditingEmployeeName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <select
                    value={editingEmployeeRole}
                    onChange={(e) => setEditingEmployeeRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="medarbeider">Medarbeider</option>
                    <option value="kontrollor">Kontrollør</option>
                    <option value="daglig_leder">Daglig leder</option>
                  </select>
                  <select
                    value={editingEmployeeStatus}
                    onChange={(e) => setEditingEmployeeStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="active">Aktiv</option>
                    <option value="paused">Pause</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEmployee}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Lagre
                    </button>
                    <button
                      onClick={() => setEditingEmployee(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-900">{employee.name}</div>
                      {employee.status === 'paused' && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">Pause</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      {employee.role === 'daglig_leder' && '👔 Daglig leder'}
                      {employee.role === 'kontrollor' && '🔍 Kontrollør'}
                      {employee.role === 'medarbeider' && '👤 Medarbeider'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditingEmployee(employee)}
                      className="p-2 hover:bg-blue-100 rounded"
                      title="Rediger"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => toggleEmployeeStatus(employee.id, employee.status || 'active')}
                      className="p-2 hover:bg-amber-100 rounded"
                      title={employee.status === 'paused' ? 'Aktiver' : 'Pause'}
                    >
                      {employee.status === 'paused' ? '▶️' : '⏸️'}
                    </button>
                    <button
                      onClick={() => deleteEmployee(employee.id)}
                      className="p-2 hover:bg-red-100 rounded"
                      title="Slett"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Rengjøringsoppgaver</h3>
          </div>
          <button
            onClick={() => setAddingTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Legg til oppgave
          </button>
        </div>

        <div className="p-6 space-y-3">
          {addingTask && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-slate-900 mb-3">Ny oppgave</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Oppgavenavn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Beskrivelse (valgfritt)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <select
                  value={newTaskZoneId}
                  onChange={(e) => setNewTaskZoneId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Ingen sone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
                <select
                  value={newTaskFrequency}
                  onChange={(e) => setNewTaskFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="daily">Daglig</option>
                  <option value="weekly">Ukentlig</option>
                  <option value="monthly">Månedlig</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={addTask}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Lagre
                  </button>
                  <button
                    onClick={() => {
                      setAddingTask(false);
                      setNewTaskName('');
                      setNewTaskDescription('');
                      setNewTaskFrequency('daily');
                      setNewTaskZoneId('');
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}

          {tasks.length === 0 && !addingTask && (
            <div className="text-center py-8 text-slate-500">
              Ingen oppgaver ennå. Klikk "Legg til oppgave" for å komme i gang.
            </div>
          )}

          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{task.task_name}</div>
                {task.description && (
                  <div className="text-sm text-slate-600">{task.description}</div>
                )}
                <div className="text-xs text-slate-500 mt-1">
                  {task.frequency === 'daily' ? 'Daglig' : task.frequency === 'weekly' ? 'Ukentlig' : 'Månedlig'}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
