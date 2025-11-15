import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileStack, Upload, Download, Trash2, ChevronDown, ChevronRight, File, FolderOpen } from 'lucide-react';

interface Document {
  id: string;
  category: string;
  subcategory: string;
  document_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
}

const CATEGORIES = {
  hms_handbook: {
    name: 'HMS Håndbok',
    subcategories: []
  },
  procedures: {
    name: 'Prosedyrer',
    subcategories: [
      'Brannrutiner',
      'Førstehjelpsrutiner',
      'Renholdsrutiner',
      'Avvikshåndtering',
      'Risikoanalyseprosedyrer',
      'Rømningsrutiner'
    ]
  },
  forms: {
    name: 'Skjemaer',
    subcategories: [
      'Risikoanalyse skjema',
      'Avviksskjema',
      'Brann Sjekkliste',
      'Førstehjelpskontroll',
      'Internrevisjon skjema'
    ]
  },
  drawings: {
    name: 'Tegninger',
    subcategories: [
      'Rømningskart',
      'Plantegning',
      'Tegning for nødlys'
    ]
  },
  contracts: {
    name: 'Kontrakter',
    subcategories: [
      'NORVA',
      'Oljeleverandør',
      'Brannservice',
      'BHT',
      'Forsikring'
    ]
  },
  external_docs: {
    name: 'Ekstern dokumentasjon',
    subcategories: [
      'Elektriker rapport',
      'Brannservice rapport',
      'Vifte/fettfilter rapport',
      'Grease trap rapport',
      'BHT rapport'
    ]
  }
};

export function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['hms_handbook']);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    document_name: '',
    file_url: '',
    file_type: 'pdf',
    file_size: 0,
    description: '',
    uploaded_by: ''
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('hms_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (data) setDocuments(data);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('hms_documents').insert([formData]);
    setFormData({
      category: '',
      subcategory: '',
      document_name: '',
      file_url: '',
      file_type: 'pdf',
      file_size: 0,
      description: '',
      uploaded_by: ''
    });
    setShowUploadForm(false);
    loadDocuments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette dokumentet?')) return;
    await supabase.from('hms_documents').delete().eq('id', id);
    loadDocuments();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFilteredDocuments = (category: string, subcategory?: string) => {
    return documents.filter(doc => {
      if (doc.category !== category) return false;
      if (subcategory && doc.subcategory !== subcategory) return false;
      return true;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FileStack className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dokumenter</h1>
              <p className="text-blue-50 mt-1">HMS dokumentasjon og filer</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Last opp dokument
          </button>
        </div>
      </div>

      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Last opp nytt dokument</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Velg kategori</option>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {formData.category && CATEGORIES[formData.category as keyof typeof CATEGORIES].subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Underkategori</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Velg underkategori</option>
                    {CATEGORIES[formData.category as keyof typeof CATEGORIES].subcategories.map((sub: string) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dokumentnavn *</label>
              <input
                type="text"
                required
                value={formData.document_name}
                onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Navn på dokumentet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fil URL *</label>
              <input
                type="text"
                required
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filtype</label>
                <input
                  type="text"
                  value={formData.file_type}
                  onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="pdf, docx, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opplastet av</label>
                <input
                  type="text"
                  value={formData.uploaded_by}
                  onChange={(e) => setFormData({ ...formData, uploaded_by: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Navn"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Valgfri beskrivelse..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Last opp
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-4 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            Kategorier
          </h3>
          <div className="space-y-1">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <div key={key}>
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {expandedCategories.includes(key) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {getFilteredDocuments(key).length}
                  </span>
                </button>
                {expandedCategories.includes(key) && cat.subcategories.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {cat.subcategories.map((sub: string) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedCategory(key);
                          setSelectedSubcategory(sub);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          selectedCategory === key && selectedSubcategory === sub
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {sub}
                        <span className="ml-2 text-xs text-gray-500">
                          ({getFilteredDocuments(key, sub).length})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">
              {selectedCategory && selectedSubcategory
                ? `${CATEGORIES[selectedCategory as keyof typeof CATEGORIES].name} - ${selectedSubcategory}`
                : 'Alle dokumenter'}
            </h3>
          </div>
          <div className="divide-y">
            {(selectedCategory && selectedSubcategory
              ? getFilteredDocuments(selectedCategory, selectedSubcategory)
              : documents
            ).map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <File className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{doc.document_name}</h4>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {doc.file_type.toUpperCase()}
                        </span>
                        {doc.file_size > 0 && <span>{formatFileSize(doc.file_size)}</span>}
                        {doc.uploaded_by && <span>av {doc.uploaded_by}</span>}
                        <span>{new Date(doc.uploaded_at).toLocaleDateString('nb-NO')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Last ned"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Slett"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(selectedCategory && selectedSubcategory
              ? getFilteredDocuments(selectedCategory, selectedSubcategory)
              : documents
            ).length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Ingen dokumenter funnet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
