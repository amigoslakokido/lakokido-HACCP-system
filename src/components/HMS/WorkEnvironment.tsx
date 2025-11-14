import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, Download, FileText, Calendar, User } from 'lucide-react';
import { hmsApi } from '../../lib/hmsSupabase';
import jsPDF from 'jspdf';

interface Assessment {
  id: string;
  assessment_date: string;
  assessed_by: string;
  department: string | null;
  overall_status: string;
  notes: string | null;
  action_plan: string | null;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

interface AssessmentItem {
  id: string;
  assessment_id: string;
  category: string;
  item_name: string;
  status: string;
  notes: string | null;
  image_url: string | null;
  priority: string | null;
  created_at: string;
  updated_at: string;
}

interface Deviation {
  id: string;
  assessment_id: string;
  item_id: string | null;
  deviation_type: string;
  description: string;
  severity: string | null;
  corrective_action: string | null;
  responsible_person: string | null;
  deadline: string | null;
  status: string;
  image_url: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const categories = [
  'Fysiske forhold',
  'Ergonomi',
  'Psykososialt miljø',
  'Verneutstyr',
  'Rengjøring og hygiene'
];

const defaultItems = {
  'Fysiske forhold': [
    'Temperatur i arbeidsområdet',
    'Ventilasjon',
    'Støynivå',
    'Belysning',
    'Luftkvalitet',
    'Plass og arbeidsplass'
  ],
  'Ergonomi': [
    'Tungt løftearbeid',
    'Arbeidsstilling',
    'Arbeidstempo',
    'Repetitivt arbeid',
    'Sklisikre matter'
  ],
  'Psykososialt miljø': [
    'Stressnivå',
    'Samarbeid i teamet',
    'Pauser',
    'Konflikthåndtering'
  ],
  'Verneutstyr': [
    'Hansker tilgjengelig',
    'Sklisikre sko',
    'Uniform/arbeidstøy',
    'Verneklær ved rengjøring'
  ],
  'Rengjøring og hygiene': [
    'Generell renhold',
    'Håndvask fasiliteter',
    'Avfallshåndtering',
    'Kjemikalier oppbevaring'
  ]
};

export function WorkEnvironment() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'deviations'>('overview');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditingAssessment, setIsEditingAssessment] = useState(false);

  const [newAssessmentForm, setNewAssessmentForm] = useState({
    assessed_by: '',
    department: '',
    notes: '',
    action_plan: '',
    next_review_date: ''
  });

  const [newDeviationForm, setNewDeviationForm] = useState({
    deviation_type: '',
    description: '',
    severity: 'Middels',
    corrective_action: '',
    responsible_person: '',
    deadline: '',
    status: 'Åpen'
  });

  const [showDeviationForm, setShowDeviationForm] = useState(false);
  const [editingDeviationId, setEditingDeviationId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAssessment) {
      loadAssessmentDetails(selectedAssessment.id);
    }
  }, [selectedAssessment]);

  const loadData = async () => {
    try {
      const assessmentsData = await hmsApi.getWorkEnvironmentAssessments();
      setAssessments(assessmentsData || []);

      if (assessmentsData && assessmentsData.length > 0) {
        setSelectedAssessment(assessmentsData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentDetails = async (assessmentId: string) => {
    try {
      const [itemsData, deviationsData] = await Promise.all([
        hmsApi.getWorkEnvironmentItems(assessmentId),
        hmsApi.getWorkEnvironmentDeviations(assessmentId)
      ]);
      setItems(itemsData || []);
      setDeviations(deviationsData || []);
    } catch (error) {
      console.error('Error loading assessment details:', error);
    }
  };

  const createNewAssessment = async () => {
    if (!newAssessmentForm.assessed_by) {
      alert('Vennligst fyll inn hvem som utfører vurderingen');
      return;
    }

    try {
      const assessment = await hmsApi.createWorkEnvironmentAssessment({
        assessed_by: newAssessmentForm.assessed_by,
        department: newAssessmentForm.department || null,
        notes: newAssessmentForm.notes || null,
        overall_status: 'OK'
      });

      const allItems: any[] = [];
      categories.forEach(category => {
        const categoryItems = defaultItems[category as keyof typeof defaultItems];
        categoryItems.forEach(itemName => {
          allItems.push({
            assessment_id: assessment.id,
            category,
            item_name: itemName,
            status: 'OK',
            priority: 'Lav'
          });
        });
      });

      await hmsApi.createWorkEnvironmentItemsBulk(allItems);

      setIsCreatingNew(false);
      setNewAssessmentForm({ assessed_by: '', department: '', notes: '', action_plan: '', next_review_date: '' });
      await loadData();
      setSelectedAssessment(assessment);
      setActiveTab('assessment');
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Kunne ikke opprette vurdering');
    }
  };

  const startEditingAssessment = () => {
    if (!selectedAssessment) return;
    setNewAssessmentForm({
      assessed_by: selectedAssessment.assessed_by,
      department: selectedAssessment.department || '',
      notes: selectedAssessment.notes || '',
      action_plan: selectedAssessment.action_plan || '',
      next_review_date: selectedAssessment.next_review_date || ''
    });
    setIsEditingAssessment(true);
  };

  const saveAssessmentEdit = async () => {
    if (!selectedAssessment) return;

    try {
      await hmsApi.updateWorkEnvironmentAssessment(selectedAssessment.id, {
        assessed_by: newAssessmentForm.assessed_by,
        department: newAssessmentForm.department || null,
        notes: newAssessmentForm.notes || null,
        action_plan: newAssessmentForm.action_plan || null,
        next_review_date: newAssessmentForm.next_review_date || null
      });

      setIsEditingAssessment(false);
      setNewAssessmentForm({ assessed_by: '', department: '', notes: '', action_plan: '', next_review_date: '' });
      await loadData();
    } catch (error) {
      console.error('Error updating assessment:', error);
      alert('Kunne ikke oppdatere vurdering');
    }
  };

  const deleteAssessment = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne kartleggingen? Dette vil også slette alle tilknyttede elementer og avvik.')) return;
    try {
      await hmsApi.deleteWorkEnvironmentAssessment(id);
      setSelectedAssessment(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Kunne ikke slette kartlegging');
    }
  };

  const updateItemStatus = async (itemId: string, status: string, notes?: string) => {
    try {
      await hmsApi.updateWorkEnvironmentItem(itemId, { status, notes });
      if (selectedAssessment) {
        await loadAssessmentDetails(selectedAssessment.id);
        await updateAssessmentStatus(selectedAssessment.id);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const updateAssessmentStatus = async (assessmentId: string) => {
    try {
      const itemsData = await hmsApi.getWorkEnvironmentItems(assessmentId);
      const needsImprovement = itemsData?.filter(i => i.status === 'Trenger forbedring').length || 0;
      const criticalItems = itemsData?.filter(i => i.priority === 'Kritisk' && i.status === 'Trenger forbedring').length || 0;

      let overallStatus = 'OK';
      if (criticalItems > 0) {
        overallStatus = 'Kritisk';
      } else if (needsImprovement > 0) {
        overallStatus = 'Trenger forbedring';
      }

      await hmsApi.updateWorkEnvironmentAssessment(assessmentId, { overall_status: overallStatus });
      await loadData();
    } catch (error) {
      console.error('Error updating assessment status:', error);
    }
  };

  const addDeviation = async () => {
    if (!selectedAssessment || !newDeviationForm.deviation_type || !newDeviationForm.description) {
      alert('Vennligst fyll inn alle obligatoriske felt');
      return;
    }

    try {
      if (editingDeviationId) {
        await hmsApi.updateWorkEnvironmentDeviation(editingDeviationId, newDeviationForm);
      } else {
        await hmsApi.createWorkEnvironmentDeviation({
          assessment_id: selectedAssessment.id,
          ...newDeviationForm
        });
      }

      setShowDeviationForm(false);
      setEditingDeviationId(null);
      setNewDeviationForm({
        deviation_type: '',
        description: '',
        severity: 'Middels',
        corrective_action: '',
        responsible_person: '',
        deadline: '',
        status: 'Åpen'
      });

      if (selectedAssessment) {
        await loadAssessmentDetails(selectedAssessment.id);
      }
    } catch (error) {
      console.error('Error saving deviation:', error);
      alert('Kunne ikke lagre avvik');
    }
  };

  const startEditingDeviation = (deviation: Deviation) => {
    setEditingDeviationId(deviation.id);
    setNewDeviationForm({
      deviation_type: deviation.deviation_type,
      description: deviation.description,
      severity: deviation.severity || 'Middels',
      corrective_action: deviation.corrective_action || '',
      responsible_person: deviation.responsible_person || '',
      deadline: deviation.deadline || '',
      status: deviation.status
    });
    setShowDeviationForm(true);
  };

  const deleteDeviation = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette avviket?')) return;
    try {
      await hmsApi.deleteWorkEnvironmentDeviation(id);
      if (selectedAssessment) {
        await loadAssessmentDetails(selectedAssessment.id);
      }
    } catch (error) {
      console.error('Error deleting deviation:', error);
    }
  };

  const generatePDF = () => {
    if (!selectedAssessment) return;

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text('Arbeidsmiljøkartlegging', 14, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.text(`Dato: ${new Date(selectedAssessment.assessment_date).toLocaleDateString('nb-NO')}`, 14, yPos);
    yPos += 6;
    doc.text(`Utført av: ${selectedAssessment.assessed_by}`, 14, yPos);
    yPos += 6;
    if (selectedAssessment.department) {
      doc.text(`Avdeling: ${selectedAssessment.department}`, 14, yPos);
      yPos += 6;
    }
    doc.text(`Status: ${selectedAssessment.overall_status}`, 14, yPos);
    yPos += 15;

    categories.forEach(category => {
      const categoryItems = items.filter(i => i.category === category);
      if (categoryItems.length === 0) return;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(category, 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      categoryItems.forEach(item => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const statusColor = item.status === 'OK' ? [0, 150, 0] : [255, 140, 0];
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(`${item.status === 'OK' ? '✓' : '⚠'} ${item.item_name}`, 16, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;

        if (item.notes) {
          doc.setFontSize(9);
          doc.text(`  ${item.notes}`, 18, yPos);
          yPos += 5;
          doc.setFontSize(10);
        }
      });

      yPos += 5;
    });

    if (deviations.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Avvik og tiltak', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      deviations.forEach((dev, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${dev.deviation_type}`, 14, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.text(`Beskrivelse: ${dev.description}`, 16, yPos);
        yPos += 5;

        if (dev.corrective_action) {
          doc.text(`Tiltak: ${dev.corrective_action}`, 16, yPos);
          yPos += 5;
        }

        doc.text(`Status: ${dev.status}`, 16, yPos);
        yPos += 8;
      });
    }

    doc.save(`arbeidsmiljo_${new Date(selectedAssessment.assessment_date).toISOString().split('T')[0]}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800 border-green-300';
      case 'Trenger forbedring': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Kritisk': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDeviationStatusColor = (status: string) => {
    switch (status) {
      case 'Åpen': return 'bg-red-100 text-red-800';
      case 'Under arbeid': return 'bg-yellow-100 text-yellow-800';
      case 'Ferdig': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Laster...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" />
            Arbeidsmiljø
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Kartlegging og vurdering av arbeidsmiljøet
          </p>
        </div>
        <div className="flex gap-2">
          {selectedAssessment && (
            <>
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                Last ned PDF
              </button>
              <button
                onClick={startEditingAssessment}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Edit2 className="w-4 h-4" />
                Rediger
              </button>
              <button
                onClick={() => deleteAssessment(selectedAssessment.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Slett
              </button>
            </>
          )}
          <button
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Ny kartlegging
          </button>
        </div>
      </div>

      {isCreatingNew && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Opprett ny arbeidsmiljøkartlegging</h3>
            <button onClick={() => setIsCreatingNew(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utført av *
              </label>
              <input
                type="text"
                value={newAssessmentForm.assessed_by}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, assessed_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Navn på person som utfører kartleggingen"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avdeling
              </label>
              <input
                type="text"
                value={newAssessmentForm.department}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="F.eks. Kjøkken, Restaurant, Bar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Innledende notater
              </label>
              <textarea
                value={newAssessmentForm.notes}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Beskriv formålet med kartleggingen..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Avbryt
              </button>
              <button
                onClick={createNewAssessment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Opprett kartlegging
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingAssessment && selectedAssessment && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Rediger arbeidsmiljøkartlegging</h3>
            <button onClick={() => setIsEditingAssessment(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utført av *
              </label>
              <input
                type="text"
                value={newAssessmentForm.assessed_by}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, assessed_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Navn på person som utfører kartleggingen"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avdeling
              </label>
              <input
                type="text"
                value={newAssessmentForm.department}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="F.eks. Kjøkken, Restaurant, Bar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Innledende notater
              </label>
              <textarea
                value={newAssessmentForm.notes}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Beskriv formålet med kartleggingen..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handlingsplan
              </label>
              <textarea
                value={newAssessmentForm.action_plan}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, action_plan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Beskriv tiltak og oppfølgingsplan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neste gjennomgangsdato
              </label>
              <input
                type="date"
                value={newAssessmentForm.next_review_date}
                onChange={(e) => setNewAssessmentForm({ ...newAssessmentForm, next_review_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingAssessment(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Avbryt
              </button>
              <button
                onClick={saveAssessmentEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Lagre endringer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Oversikt
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'assessment'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled={!selectedAssessment}
        >
          Kartlegging
        </button>
        <button
          onClick={() => setActiveTab('deviations')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'deviations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled={!selectedAssessment}
        >
          Avvik og tiltak
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Ingen arbeidsmiljøkartlegginger registrert ennå</p>
            </div>
          ) : (
            assessments.map((assessment) => (
              <div
                key={assessment.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition ${
                  selectedAssessment?.id === assessment.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedAssessment(assessment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Kartlegging {new Date(assessment.assessment_date).toLocaleDateString('nb-NO')}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assessment.overall_status)}`}>
                        {assessment.overall_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {assessment.assessed_by}
                      </div>
                      {assessment.department && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {assessment.department}
                        </div>
                      )}
                      {assessment.next_review_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Neste vurdering: {new Date(assessment.next_review_date).toLocaleDateString('nb-NO')}
                        </div>
                      )}
                    </div>
                    {assessment.notes && (
                      <p className="text-gray-700 mt-2">{assessment.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'assessment' && selectedAssessment && (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = items.filter(i => i.category === category);
            const needsImprovement = categoryItems.filter(i => i.status === 'Trenger forbedring').length;

            return (
              <div key={category} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  {needsImprovement > 0 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {needsImprovement} trenger forbedring
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {categoryItems.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                            {item.status === 'OK' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-yellow-600" />
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mb-2">{item.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <select
                          value={item.status}
                          onChange={(e) => updateItemStatus(item.id, e.target.value, item.notes || undefined)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="OK">OK</option>
                          <option value="Trenger forbedring">Trenger forbedring</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Legg til notater..."
                          value={item.notes || ''}
                          onChange={(e) => updateItemStatus(item.id, item.status, e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'deviations' && selectedAssessment && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Registrerte avvik og tiltak</h3>
            <button
              onClick={() => setShowDeviationForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Registrer avvik
            </button>
          </div>

          {showDeviationForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{editingDeviationId ? 'Rediger avvik' : 'Nytt avvik'}</h4>
                <button
                  onClick={() => {
                    setShowDeviationForm(false);
                    setEditingDeviationId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type avvik *</label>
                    <input
                      type="text"
                      value={newDeviationForm.deviation_type}
                      onChange={(e) => setNewDeviationForm({ ...newDeviationForm, deviation_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="F.eks. Ventilasjon, Ergonomi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alvorlighetsgrad</label>
                    <select
                      value={newDeviationForm.severity}
                      onChange={(e) => setNewDeviationForm({ ...newDeviationForm, severity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Lav">Lav</option>
                      <option value="Middels">Middels</option>
                      <option value="Høy">Høy</option>
                      <option value="Kritisk">Kritisk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse *</label>
                  <textarea
                    value={newDeviationForm.description}
                    onChange={(e) => setNewDeviationForm({ ...newDeviationForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Beskriv avviket..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Korrigerende tiltak</label>
                  <textarea
                    value={newDeviationForm.corrective_action}
                    onChange={(e) => setNewDeviationForm({ ...newDeviationForm, corrective_action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Hva skal gjøres for å rette opp avviket?"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ansvarlig person</label>
                    <input
                      type="text"
                      value={newDeviationForm.responsible_person}
                      onChange={(e) => setNewDeviationForm({ ...newDeviationForm, responsible_person: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Navn på ansvarlig"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frist</label>
                    <input
                      type="date"
                      value={newDeviationForm.deadline}
                      onChange={(e) => setNewDeviationForm({ ...newDeviationForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newDeviationForm.status}
                      onChange={(e) => setNewDeviationForm({ ...newDeviationForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Åpen">Åpen</option>
                      <option value="Under arbeid">Under arbeid</option>
                      <option value="Ferdig">Ferdig</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeviationForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={addDeviation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    Lagre avvik
                  </button>
                </div>
              </div>
            </div>
          )}

          {deviations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Ingen avvik registrert for denne kartleggingen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deviations.map((deviation) => (
                <div key={deviation.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{deviation.deviation_type}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDeviationStatusColor(deviation.status)}`}>
                          {deviation.status}
                        </span>
                        {deviation.severity && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            deviation.severity === 'Kritisk' ? 'bg-red-100 text-red-800' :
                            deviation.severity === 'Høy' ? 'bg-orange-100 text-orange-800' :
                            deviation.severity === 'Middels' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {deviation.severity}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{deviation.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingDeviation(deviation)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDeviation(deviation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {deviation.corrective_action && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-medium text-blue-900 mb-2">Korrigerende tiltak:</div>
                      <p className="text-blue-800">{deviation.corrective_action}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {deviation.responsible_person && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {deviation.responsible_person}
                      </div>
                    )}
                    {deviation.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Frist: {new Date(deviation.deadline).toLocaleDateString('nb-NO')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
