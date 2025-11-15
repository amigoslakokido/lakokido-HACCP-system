import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  AlertCircle,
  Users,
  Map,
  Calendar,
  FileText,
  Download,
  Plus,
  Save,
  Edit2,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import { AssistantPanel } from './AssistantPanel';

interface EvacuationPlan {
  id: string;
  warning_procedure: string;
  evacuation_procedure: string;
  escape_routes: string;
  assembly_point: string;
  post_evacuation_instructions: string;
}

interface EvacuationRole {
  id: string;
  role_type: string;
  person_name: string;
  phone: string;
  department: string;
}

interface EscapeRoute {
  id: string;
  route_name: string;
  description: string;
  image_url: string;
}

interface EvacuationDrill {
  id: string;
  drill_date: string;
  responsible_person: string;
  participants: string;
  deviations: string;
  media_url: string;
}

interface EvacuationDocument {
  id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export function Evacuation() {
  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(false);

  // States
  const [evacuationPlan, setEvacuationPlan] = useState<EvacuationPlan | null>(null);
  const [roles, setRoles] = useState<EvacuationRole[]>([]);
  const [escapeRoutes, setEscapeRoutes] = useState<EscapeRoute[]>([]);
  const [drills, setDrills] = useState<EvacuationDrill[]>([]);
  const [documents, setDocuments] = useState<EvacuationDocument[]>([]);

  // Form states
  const [planForm, setPlanForm] = useState({
    warning_procedure: '',
    evacuation_procedure: '',
    escape_routes: '',
    assembly_point: '',
    post_evacuation_instructions: ''
  });

  const [roleForm, setRoleForm] = useState({
    role_type: 'evacuation_leader',
    person_name: '',
    phone: '',
    department: ''
  });

  const [routeForm, setRouteForm] = useState({
    route_name: '',
    description: '',
    image_url: ''
  });

  const [drillForm, setDrillForm] = useState({
    drill_date: '',
    responsible_person: '',
    participants: '',
    deviations: '',
    media_url: ''
  });

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingDrillId, setEditingDrillId] = useState<string | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showDrillForm, setShowDrillForm] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadEvacuationPlan(),
        loadRoles(),
        loadEscapeRoutes(),
        loadDrills(),
        loadDocuments()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvacuationPlan = async () => {
    const { data, error } = await supabase
      .from('hms_evacuation_plan')
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (data) {
      setEvacuationPlan(data);
      setPlanForm({
        warning_procedure: data.warning_procedure || '',
        evacuation_procedure: data.evacuation_procedure || '',
        escape_routes: data.escape_routes || '',
        assembly_point: data.assembly_point || '',
        post_evacuation_instructions: data.post_evacuation_instructions || ''
      });
    }
  };

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from('hms_evacuation_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setRoles(data || []);
  };

  const loadEscapeRoutes = async () => {
    const { data, error } = await supabase
      .from('hms_escape_routes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setEscapeRoutes(data || []);
  };

  const loadDrills = async () => {
    const { data, error } = await supabase
      .from('hms_evacuation_drills')
      .select('*')
      .order('drill_date', { ascending: false });

    if (error) throw error;
    setDrills(data || []);
  };

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('hms_evacuation_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    setDocuments(data || []);
  };

  const saveEvacuationPlan = async () => {
    try {
      if (evacuationPlan?.id) {
        await supabase
          .from('hms_evacuation_plan')
          .update({ ...planForm, updated_at: new Date().toISOString() })
          .eq('id', evacuationPlan.id);
      } else {
        await supabase
          .from('hms_evacuation_plan')
          .insert([planForm]);
      }

      setEditingPlan(false);
      await loadEvacuationPlan();
      alert('Evakueringsplan lagret!');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Kunne ikke lagre evakueringsplan');
    }
  };

  const saveRole = async () => {
    try {
      if (editingRoleId) {
        await supabase
          .from('hms_evacuation_roles')
          .update({ ...roleForm, updated_at: new Date().toISOString() })
          .eq('id', editingRoleId);
      } else {
        await supabase
          .from('hms_evacuation_roles')
          .insert([roleForm]);
      }

      resetRoleForm();
      await loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Kunne ikke lagre rolle');
    }
  };

  const deleteRole = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne rollen?')) return;

    try {
      await supabase
        .from('hms_evacuation_roles')
        .delete()
        .eq('id', id);

      await loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const saveRoute = async () => {
    try {
      if (editingRouteId) {
        await supabase
          .from('hms_escape_routes')
          .update({ ...routeForm, updated_at: new Date().toISOString() })
          .eq('id', editingRouteId);
      } else {
        await supabase
          .from('hms_escape_routes')
          .insert([routeForm]);
      }

      resetRouteForm();
      await loadEscapeRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Kunne ikke lagre rømningsvei');
    }
  };

  const deleteRoute = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne rømningsveien?')) return;

    try {
      await supabase
        .from('hms_escape_routes')
        .delete()
        .eq('id', id);

      await loadEscapeRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  const saveDrill = async () => {
    try {
      if (editingDrillId) {
        await supabase
          .from('hms_evacuation_drills')
          .update({ ...drillForm, updated_at: new Date().toISOString() })
          .eq('id', editingDrillId);
      } else {
        await supabase
          .from('hms_evacuation_drills')
          .insert([drillForm]);
      }

      resetDrillForm();
      await loadDrills();
    } catch (error) {
      console.error('Error saving drill:', error);
      alert('Kunne ikke lagre evakueringsøvelse');
    }
  };

  const deleteDrill = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne øvelsen?')) return;

    try {
      await supabase
        .from('hms_evacuation_drills')
        .delete()
        .eq('id', id);

      await loadDrills();
    } catch (error) {
      console.error('Error deleting drill:', error);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({
      role_type: 'evacuation_leader',
      person_name: '',
      phone: '',
      department: ''
    });
    setEditingRoleId(null);
    setShowRoleForm(false);
  };

  const resetRouteForm = () => {
    setRouteForm({
      route_name: '',
      description: '',
      image_url: ''
    });
    setEditingRouteId(null);
    setShowRouteForm(false);
  };

  const resetDrillForm = () => {
    setDrillForm({
      drill_date: '',
      responsible_person: '',
      participants: '',
      deviations: '',
      media_url: ''
    });
    setEditingDrillId(null);
    setShowDrillForm(false);
  };

  const editRole = (role: EvacuationRole) => {
    setRoleForm({
      role_type: role.role_type,
      person_name: role.person_name,
      phone: role.phone,
      department: role.department
    });
    setEditingRoleId(role.id);
    setShowRoleForm(true);
  };

  const editRoute = (route: EscapeRoute) => {
    setRouteForm({
      route_name: route.route_name,
      description: route.description,
      image_url: route.image_url
    });
    setEditingRouteId(route.id);
    setShowRouteForm(true);
  };

  const editDrill = (drill: EvacuationDrill) => {
    setDrillForm({
      drill_date: drill.drill_date,
      responsible_person: drill.responsible_person,
      participants: drill.participants,
      deviations: drill.deviations,
      media_url: drill.media_url
    });
    setEditingDrillId(drill.id);
    setShowDrillForm(true);
  };

  const getRoleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      evacuation_leader: 'Evakueringsleder',
      fire_responsible: 'Brannansvarlig',
      assembly_point_responsible: 'Samlingspunkt-ansvarlig'
    };
    return labels[type] || type;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('Evakueringsplan', 14, yPos);
    yPos += 15;

    if (evacuationPlan) {
      doc.setFontSize(12);

      doc.setFont('helvetica', 'bold');
      doc.text('Varsling:', 14, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(evacuationPlan.warning_procedure || 'Ikke angitt', 14, yPos, { maxWidth: 180 });
      yPos += 15;

      doc.setFont('helvetica', 'bold');
      doc.text('Evakueringsrutiner:', 14, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(evacuationPlan.evacuation_procedure || 'Ikke angitt', 14, yPos, { maxWidth: 180 });
      yPos += 15;

      doc.setFont('helvetica', 'bold');
      doc.text('Samlingspunkt:', 14, yPos);
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(evacuationPlan.assembly_point || 'Ikke angitt', 14, yPos, { maxWidth: 180 });
      yPos += 15;
    }

    if (roles.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Roller:', 14, yPos);
      yPos += 7;

      roles.forEach(role => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${getRoleTypeLabel(role.role_type)}: ${role.person_name} - ${role.phone}`, 14, yPos);
        yPos += 7;
      });
    }

    doc.save('evakueringsplan.pdf');
  };

  if (loading) {
    return <div className="text-center py-8">Laster...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="text-red-600" />
            Evakuering
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Evakueringsplan og beredskap
          </p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          Last ned PDF
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'plan', label: 'Evakueringsplan' },
          { id: 'roles', label: 'Roller' },
          { id: 'routes', label: 'Rømningsveier' },
          { id: 'drills', label: 'Øvelser' },
          { id: 'documents', label: 'Dokumenter' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'plan' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Evakueringsplan</h3>
            {!editingPlan && (
              <button
                onClick={() => setEditingPlan(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4" />
                Rediger
              </button>
            )}
          </div>

          {editingPlan ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varsling
                </label>
                <textarea
                  value={planForm.warning_procedure}
                  onChange={(e) => setPlanForm({ ...planForm, warning_procedure: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Beskriv hvordan varsel om evakuering gis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evakueringsrutiner
                </label>
                <textarea
                  value={planForm.evacuation_procedure}
                  onChange={(e) => setPlanForm({ ...planForm, evacuation_procedure: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Beskriv hvordan evakueringen skal gjennomføres..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rømningsveier
                </label>
                <textarea
                  value={planForm.escape_routes}
                  onChange={(e) => setPlanForm({ ...planForm, escape_routes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Beskriv rømningsveiene..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Samlingspunkt
                </label>
                <textarea
                  value={planForm.assembly_point}
                  onChange={(e) => setPlanForm({ ...planForm, assembly_point: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Angi samlingspunkt..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruksjoner etter evakuering
                </label>
                <textarea
                  value={planForm.post_evacuation_instructions}
                  onChange={(e) => setPlanForm({ ...planForm, post_evacuation_instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Beskriv hva som skal gjøres etter evakuering..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveEvacuationPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  Lagre
                </button>
                <button
                  onClick={() => setEditingPlan(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Varsling</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{evacuationPlan?.warning_procedure || 'Ikke angitt'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Evakueringsrutiner</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{evacuationPlan?.evacuation_procedure || 'Ikke angitt'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Rømningsveier</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{evacuationPlan?.escape_routes || 'Ikke angitt'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Samlingspunkt</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{evacuationPlan?.assembly_point || 'Ikke angitt'}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Instruksjoner etter evakuering</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{evacuationPlan?.post_evacuation_instructions || 'Ikke angitt'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Roller</h3>
            {!showRoleForm && (
              <button
                onClick={() => setShowRoleForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Legg til rolle
              </button>
            )}
          </div>

          {showRoleForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{editingRoleId ? 'Rediger rolle' : 'Ny rolle'}</h4>
                <button onClick={resetRoleForm}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                  <select
                    value={roleForm.role_type}
                    onChange={(e) => setRoleForm({ ...roleForm, role_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="evacuation_leader">Evakueringsleder</option>
                    <option value="fire_responsible">Brannansvarlig</option>
                    <option value="assembly_point_responsible">Samlingspunkt-ansvarlig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Navn *</label>
                  <input
                    type="text"
                    value={roleForm.person_name}
                    onChange={(e) => setRoleForm({ ...roleForm, person_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Fullt navn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={roleForm.phone}
                    onChange={(e) => setRoleForm({ ...roleForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="+47 xxx xx xxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avdeling</label>
                  <input
                    type="text"
                    value={roleForm.department}
                    onChange={(e) => setRoleForm({ ...roleForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Avdeling"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveRole}
                    disabled={!roleForm.person_name}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                  <button
                    onClick={resetRoleForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">{getRoleTypeLabel(role.role_type)}</span>
                  </div>
                  <p className="text-gray-700">{role.person_name}</p>
                  {role.phone && <p className="text-sm text-gray-600">Telefon: {role.phone}</p>}
                  {role.department && <p className="text-sm text-gray-600">Avdeling: {role.department}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editRole(role)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRole(role.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {roles.length === 0 && !showRoleForm && (
              <p className="text-center text-gray-500 py-8">Ingen roller registrert</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Rømningsveier</h3>
            {!showRouteForm && (
              <button
                onClick={() => setShowRouteForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Legg til rømningsvei
              </button>
            )}
          </div>

          {showRouteForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{editingRouteId ? 'Rediger rømningsvei' : 'Ny rømningsvei'}</h4>
                <button onClick={resetRouteForm}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Navn *</label>
                  <input
                    type="text"
                    value={routeForm.route_name}
                    onChange={(e) => setRouteForm({ ...routeForm, route_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="F.eks. Hovedinngang, Nødutgang vest"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
                  <textarea
                    value={routeForm.description}
                    onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Beskriv rømningsveien..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bilde URL</label>
                  <input
                    type="text"
                    value={routeForm.image_url}
                    onChange={(e) => setRouteForm({ ...routeForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="URL til bilde eller tegning"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Last opp bilde til et bildehotell og lim inn URL her
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveRoute}
                    disabled={!routeForm.route_name}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                  <button
                    onClick={resetRouteForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escapeRoutes.map((route) => (
              <div key={route.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">{route.route_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editRoute(route)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {route.description && (
                  <p className="text-sm text-gray-700 mb-3">{route.description}</p>
                )}
                {route.image_url && (
                  <img
                    src={route.image_url}
                    alt={route.route_name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            ))}

            {escapeRoutes.length === 0 && !showRouteForm && (
              <p className="col-span-2 text-center text-gray-500 py-8">Ingen rømningsveier registrert</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'drills' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Evakueringsøvelser</h3>
            {!showDrillForm && (
              <button
                onClick={() => setShowDrillForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Registrer øvelse
              </button>
            )}
          </div>

          {showDrillForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{editingDrillId ? 'Rediger øvelse' : 'Ny øvelse'}</h4>
                <button onClick={resetDrillForm}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label>
                  <input
                    type="date"
                    value={drillForm.drill_date}
                    onChange={(e) => setDrillForm({ ...drillForm, drill_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ansvarlig *</label>
                  <input
                    type="text"
                    value={drillForm.responsible_person}
                    onChange={(e) => setDrillForm({ ...drillForm, responsible_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Navn på ansvarlig"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deltagere</label>
                  <textarea
                    value={drillForm.participants}
                    onChange={(e) => setDrillForm({ ...drillForm, participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Liste over deltagere..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avvik/forbedringspunkter</label>
                  <textarea
                    value={drillForm.deviations}
                    onChange={(e) => setDrillForm({ ...drillForm, deviations: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="Noter avvik eller forbedringspunkter..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
                  <input
                    type="text"
                    value={drillForm.media_url}
                    onChange={(e) => setDrillForm({ ...drillForm, media_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="URL til bilde eller video"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Last opp media til et filhotell og lim inn URL her
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={saveDrill}
                    disabled={!drillForm.drill_date || !drillForm.responsible_person}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    <Save className="w-4 h-4" />
                    Lagre
                  </button>
                  <button
                    onClick={resetDrillForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {drills.map((drill) => (
              <div key={drill.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {new Date(drill.drill_date).toLocaleDateString('nb-NO')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editDrill(drill)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDrill(drill.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Ansvarlig:</strong> {drill.responsible_person}
                </p>
                {drill.participants && (
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Deltagere:</strong> {drill.participants}
                  </p>
                )}
                {drill.deviations && (
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Avvik/forbedringer:</strong> {drill.deviations}
                  </p>
                )}
                {drill.media_url && (
                  <div className="mt-3">
                    <img
                      src={drill.media_url}
                      alt="Øvelse"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}

            {drills.length === 0 && !showDrillForm && (
              <p className="text-center text-gray-500 py-8">Ingen øvelser registrert</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Dokumenter</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="w-4 h-4" />
              Last opp dokument
            </button>
          </div>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{doc.document_name}</p>
                    <p className="text-xs text-gray-600">
                      {doc.uploaded_by} - {new Date(doc.uploaded_at).toLocaleDateString('nb-NO')}
                    </p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}

            {documents.length === 0 && (
              <p className="text-center text-gray-500 py-8">Ingen dokumenter lastet opp</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
