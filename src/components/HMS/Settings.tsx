import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, Mail, Phone, Globe, User, MapPin, Save, Leaf, Shield } from 'lucide-react';

interface CompanyInfo {
  id: string;
  company_name: string;
  org_number: string;
  phone: string;
  email: string;
  website: string;
  manager_name: string;
  address: string;
  environmental_commitment: string;
  safety_policy: string;
}

export function Settings() {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hms_company_info')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) setCompany(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);

    const { error } = await supabase
      .from('hms_company_info')
      .update(company)
      .eq('id', company.id);

    if (!error) {
      setEditMode(false);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">جاري التحميل... Laster...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Ingen selskapsdata funnet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Selskapsinformasjon</h2>
          <p className="text-slate-600">معلومات الشركة</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold"
          >
            Rediger
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Lagrer...' : 'Lagre'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                loadCompanyInfo();
              }}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-bold"
            >
              Avbryt
            </button>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">{company.company_name}</h1>
            <p className="text-purple-100 text-lg">Organisasjonsnummer: {company.org_number}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Phone className="w-6 h-6 text-purple-600" />
            Kontaktinformasjon
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Telefon</label>
              {editMode ? (
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-slate-900">{company.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">E-post</label>
              {editMode ? (
                <input
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-slate-900">{company.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nettside</label>
              {editMode ? (
                <input
                  type="text"
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-slate-900">{company.website}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-purple-600" />
            Ledelse og Adresse
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Daglig leder</label>
              {editMode ? (
                <input
                  type="text"
                  value={company.manager_name}
                  onChange={(e) => setCompany({ ...company, manager_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="text-slate-900">{company.manager_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Adresse</label>
              {editMode ? (
                <textarea
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              ) : (
                <p className="text-slate-900">{company.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-600" />
          Miljøforpliktelse
        </h3>
        {editMode ? (
          <textarea
            value={company.environmental_commitment}
            onChange={(e) => setCompany({ ...company, environmental_commitment: e.target.value })}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            rows={6}
          />
        ) : (
          <p className="text-slate-700 leading-relaxed">{company.environmental_commitment}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Sikkerhetspolicy
        </h3>
        {editMode ? (
          <textarea
            value={company.safety_policy}
            onChange={(e) => setCompany({ ...company, safety_policy: e.target.value })}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            rows={6}
          />
        ) : (
          <p className="text-slate-700 leading-relaxed">{company.safety_policy}</p>
        )}
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border-2 border-emerald-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">♻️ Bærekraftige Partnere</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">L</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">LEKO Mater AS</p>
              <p className="text-sm text-slate-600">Miljøvennlig gulvrengjøring</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">N</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">NORVA AS</p>
              <p className="text-sm text-slate-600">Avhending av matolje og fett</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
