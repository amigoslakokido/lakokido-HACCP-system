import { supabase } from './supabase';

export interface HMSCompanySettings {
  id: string;
  company_name: string;
  org_number: string;
  phone: string;
  email: string;
  website: string;
  manager_name: string;
  address: string;
  description_no?: string;
  description_ar?: string;
  environmental_title_no?: string;
  environmental_title_ar?: string;
  hms_commitment_title_no?: string;
  hms_commitment_title_ar?: string;
  created_at: string;
  updated_at: string;
}

export interface EnvironmentalPartner {
  id: string;
  name: string;
  service: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export const hmsCompanyApi = {
  async getCompanySettings() {
    return await supabase
      .from('hms_company_settings')
      .select('*')
      .maybeSingle();
  },

  async updateCompanySettings(data: Partial<HMSCompanySettings>) {
    const { data: existing } = await supabase
      .from('hms_company_settings')
      .select('id')
      .maybeSingle();

    if (existing) {
      return await supabase
        .from('hms_company_settings')
        .update(data)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('hms_company_settings')
        .insert(data)
        .select()
        .single();
    }
  },

  async getEnvironmentalPartners(includeDeleted = false) {
    let query = supabase
      .from('hms_environmental_partners')
      .select('*')
      .order('name');

    if (!includeDeleted) {
      query = query.eq('is_active', true).is('deleted_at', null);
    }

    return await query;
  },

  async createPartner(partner: Partial<EnvironmentalPartner>) {
    return await supabase
      .from('hms_environmental_partners')
      .insert({
        ...partner,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
  },

  async updatePartner(id: string, data: Partial<EnvironmentalPartner>) {
    return await supabase
      .from('hms_environmental_partners')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  },

  async softDeletePartner(id: string) {
    return await supabase
      .from('hms_environmental_partners')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  },

  async restorePartner(id: string) {
    return await supabase
      .from('hms_environmental_partners')
      .update({
        is_active: true,
        deleted_at: null
      })
      .eq('id', id)
      .select()
      .single();
  }
};
