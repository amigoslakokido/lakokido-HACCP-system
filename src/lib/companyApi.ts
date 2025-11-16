import { supabase } from './supabase';

export interface CompanyInfo {
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
  environmental_policy?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name_no: string;
  name_ar: string;
  description?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  position_no?: string;
  position_ar?: string;
  department_id?: string;
  hire_date?: string;
  active: boolean;
  status?: string;
  deleted_at?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CompanyDocument {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  category: 'maintenance' | 'cleaning' | 'safety' | 'training' | 'contract' | 'certificate' | 'inspection' | 'report' | 'other';
  department_id?: string;
  uploaded_by?: string;
  upload_date: string;
  document_date?: string;
  is_public: boolean;
  tags?: string[];
  created_at: string;
}

export const companyApi = {
  async getCompanyInfo() {
    return await supabase
      .from('company_info')
      .select('*')
      .single();
  },

  async updateCompanyInfo(data: Partial<CompanyInfo>) {
    const { data: existing } = await supabase
      .from('company_info')
      .select('id')
      .maybeSingle();

    if (existing) {
      return await supabase
        .from('company_info')
        .update(data)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('company_info')
        .insert(data)
        .select()
        .single();
    }
  },

  async getDepartments() {
    return await supabase
      .from('departments')
      .select('*')
      .order('name_no');
  },

  async getEmployees(includeDeleted = false) {
    let query = supabase
      .from('employees')
      .select('*, departments(name_no, name_ar)')
      .order('name');

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    return await query;
  },

  async getActiveEmployees() {
    return await supabase
      .from('employees')
      .select('*')
      .eq('active', true)
      .is('deleted_at', null)
      .order('name');
  },

  async createEmployee(employee: Partial<Employee>) {
    return await supabase
      .from('employees')
      .insert({
        ...employee,
        active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
  },

  async updateEmployee(id: string, data: Partial<Employee>) {
    return await supabase
      .from('employees')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  },

  async softDeleteEmployee(id: string) {
    return await supabase
      .from('employees')
      .update({
        active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  },

  async restoreEmployee(id: string) {
    return await supabase
      .from('employees')
      .update({
        active: true,
        deleted_at: null
      })
      .eq('id', id)
      .select()
      .single();
  },

  async getDocuments(filters?: {
    department_id?: string;
    category?: string;
    search?: string;
  }) {
    let query = supabase
      .from('company_documents')
      .select('*, departments(name_no, name_ar), employees(name)')
      .order('upload_date', { ascending: false });

    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    return await query;
  },

  async createDocument(doc: Partial<CompanyDocument>) {
    return await supabase
      .from('company_documents')
      .insert(doc)
      .select()
      .single();
  },

  async updateDocument(id: string, data: Partial<CompanyDocument>) {
    return await supabase
      .from('company_documents')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteDocument(id: string) {
    return await supabase
      .from('company_documents')
      .delete()
      .eq('id', id);
  },

  async uploadFile(file: File, path: string) {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('company-files')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('company-files')
      .getPublicUrl(filePath);

    return { path: filePath, url: publicUrl };
  },

  async getFileUrl(path: string) {
    const { data } = supabase.storage
      .from('company-files')
      .getPublicUrl(path);

    return data.publicUrl;
  },

  async getEmployeeSchedules() {
    return await supabase
      .from('employee_schedules')
      .select('*, employees(id, name)')
      .eq('is_active', true)
      .order('day_of_week')
      .order('schedule_name');
  },

  async getScheduledEmployeesForDate(date: string) {
    const { data, error } = await supabase
      .rpc('get_scheduled_employees_for_date', { target_date: date });

    if (error) throw error;
    return { data, error: null };
  },

  async createEmployeeSchedule(schedule: {
    employee_id: string;
    schedule_name: string;
    day_of_week: number;
    start_date: string;
    end_date?: string | null;
    notes?: string;
  }) {
    return await supabase
      .from('employee_schedules')
      .insert(schedule)
      .select()
      .single();
  },

  async updateEmployeeSchedule(id: string, data: Partial<{
    schedule_name: string;
    day_of_week: number;
    is_active: boolean;
    start_date: string;
    end_date: string | null;
    notes: string;
  }>) {
    return await supabase
      .from('employee_schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  async deleteEmployeeSchedule(id: string) {
    return await supabase
      .from('employee_schedules')
      .delete()
      .eq('id', id);
  },

  async bulkCreateSchedules(schedules: Array<{
    employee_id: string;
    schedule_name: string;
    day_of_week: number;
    start_date: string;
    end_date?: string | null;
  }>) {
    return await supabase
      .from('employee_schedules')
      .insert(schedules)
      .select();
  }
};
