import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'staff';
  created_at: string;
  updated_at: string;
};

export type TemperatureZone = {
  id: string;
  name_no: string;
  zone_type: 'refrigerator' | 'freezer' | 'dishwasher' | 'meat_serving' | 'receiving';
  min_temp: number;
  max_temp: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type TemperatureItem = {
  id: string;
  zone_id: string;
  name_no: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type TemperatureLog = {
  id: string;
  item_id: string;
  recorded_temp: number;
  recorded_date: string;
  recorded_by: string;
  status: 'safe' | 'warning' | 'danger';
  notes: string;
  created_at: string;
};

export type CleaningTask = {
  id: string;
  name_no: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  description?: string;
};

export type CleaningLog = {
  id: string;
  task_id: string;
  log_date: string;
  is_completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  notes: string;
};

export type DailyReport = {
  id: string;
  report_date: string;
  pdf_url: string | null;
  overall_status: 'safe' | 'warning' | 'danger';
  generated_by: string;
  generated_at: string;
  notes: string;
};
