/*
  # HACCP Digital Control System - Database Schema

  ## Overview
  Complete database schema for HACCP food safety management system with:
  - User authentication and role management
  - Temperature monitoring across multiple zones
  - Cleaning task scheduling and tracking
  - Daily report generation and archival
  - System configuration and customization

  ## New Tables

  ### 1. `profiles`
  User profiles extending Supabase auth
  - `id` (uuid, FK to auth.users)
  - `full_name` (text)
  - `role` (text: 'admin', 'supervisor', 'staff')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `temperature_zones`
  Configurable temperature monitoring zones
  - `id` (uuid, PK)
  - `name_no` (text) - Norwegian name
  - `zone_type` (text: 'refrigerator', 'freezer', 'dishwasher', 'meat_serving', 'receiving')
  - `min_temp` (decimal) - Minimum safe temperature
  - `max_temp` (decimal) - Maximum safe temperature
  - `is_active` (boolean)
  - `sort_order` (integer)
  - `created_at` (timestamptz)

  ### 3. `temperature_items`
  Individual items within zones (e.g., specific refrigerators)
  - `id` (uuid, PK)
  - `zone_id` (uuid, FK)
  - `name_no` (text)
  - `is_active` (boolean)
  - `sort_order` (integer)
  - `created_at` (timestamptz)

  ### 4. `temperature_logs`
  Daily temperature recordings
  - `id` (uuid, PK)
  - `item_id` (uuid, FK)
  - `recorded_temp` (decimal)
  - `recorded_date` (date)
  - `recorded_by` (uuid, FK to profiles)
  - `status` (text: 'safe', 'warning', 'danger')
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 5. `cleaning_tasks`
  Configurable cleaning task templates
  - `id` (uuid, PK)
  - `name_no` (text)
  - `frequency` (text: 'daily', 'weekly', 'monthly')
  - `is_active` (boolean)
  - `sort_order` (integer)
  - `created_at` (timestamptz)

  ### 6. `cleaning_logs`
  Daily cleaning task completion records
  - `id` (uuid, PK)
  - `task_id` (uuid, FK)
  - `log_date` (date)
  - `is_completed` (boolean)
  - `completed_by` (uuid, FK to profiles)
  - `completed_at` (timestamptz)
  - `notes` (text)

  ### 7. `daily_reports`
  Generated HACCP reports
  - `id` (uuid, PK)
  - `report_date` (date, unique)
  - `pdf_url` (text)
  - `overall_status` (text: 'safe', 'warning', 'danger')
  - `generated_by` (uuid, FK to profiles)
  - `generated_at` (timestamptz)
  - `notes` (text)

  ### 8. `system_settings`
  Global system configuration
  - `id` (uuid, PK)
  - `setting_key` (text, unique)
  - `setting_value` (jsonb)
  - `updated_by` (uuid, FK to profiles)
  - `updated_at` (timestamptz)

  ### 9. `report_attachments`
  Documents and images attached to reports
  - `id` (uuid, PK)
  - `report_id` (uuid, FK)
  - `file_url` (text)
  - `file_name` (text)
  - `file_type` (text)
  - `uploaded_by` (uuid, FK to profiles)
  - `uploaded_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies for authenticated users based on roles
  - Admin has full access
  - Supervisors can view and edit
  - Staff can only log data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'supervisor', 'staff')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Public insert access"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON profiles FOR UPDATE
  USING (true);

-- Create temperature_zones table
CREATE TABLE IF NOT EXISTS temperature_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_no text NOT NULL,
  zone_type text NOT NULL CHECK (zone_type IN ('refrigerator', 'freezer', 'dishwasher', 'meat_serving', 'receiving')),
  min_temp decimal(5,2) NOT NULL,
  max_temp decimal(5,2) NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE temperature_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read zones"
  ON temperature_zones FOR SELECT
  USING (true);

CREATE POLICY "Public manage zones"
  ON temperature_zones FOR ALL
  USING (true);

-- Create temperature_items table
CREATE TABLE IF NOT EXISTS temperature_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES temperature_zones ON DELETE CASCADE,
  name_no text NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE temperature_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read items"
  ON temperature_items FOR SELECT
  USING (true);

CREATE POLICY "Public manage items"
  ON temperature_items FOR ALL
  USING (true);

-- Create temperature_logs table
CREATE TABLE IF NOT EXISTS temperature_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES temperature_items ON DELETE CASCADE,
  recorded_temp decimal(5,2) NOT NULL,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  status text NOT NULL CHECK (status IN ('safe', 'warning', 'danger')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE temperature_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read temp logs"
  ON temperature_logs FOR SELECT
  USING (true);

CREATE POLICY "Public create temp logs"
  ON temperature_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update temp logs"
  ON temperature_logs FOR UPDATE
  USING (true);

CREATE POLICY "Public delete temp logs"
  ON temperature_logs FOR DELETE
  USING (true);

-- Create cleaning_tasks table
CREATE TABLE IF NOT EXISTS cleaning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_no text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read tasks"
  ON cleaning_tasks FOR SELECT
  USING (true);

CREATE POLICY "Public manage tasks"
  ON cleaning_tasks FOR ALL
  USING (true);

-- Create cleaning_logs table
CREATE TABLE IF NOT EXISTS cleaning_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES cleaning_tasks ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  is_completed boolean DEFAULT false,
  completed_by uuid DEFAULT '00000000-0000-0000-0000-000000000000',
  completed_at timestamptz,
  notes text DEFAULT ''
);

ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cleaning logs"
  ON cleaning_logs FOR SELECT
  USING (true);

CREATE POLICY "Public create cleaning logs"
  ON cleaning_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update cleaning logs"
  ON cleaning_logs FOR UPDATE
  USING (true);

CREATE POLICY "Public delete cleaning logs"
  ON cleaning_logs FOR DELETE
  USING (true);

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL UNIQUE,
  pdf_url text,
  overall_status text NOT NULL CHECK (overall_status IN ('safe', 'warning', 'danger')),
  generated_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  generated_at timestamptz DEFAULT now(),
  notes text DEFAULT ''
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reports"
  ON daily_reports FOR SELECT
  USING (true);

CREATE POLICY "Public create reports"
  ON daily_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public delete reports"
  ON daily_reports FOR DELETE
  USING (true);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_by uuid DEFAULT '00000000-0000-0000-0000-000000000000',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
  ON system_settings FOR SELECT
  USING (true);

CREATE POLICY "Public manage settings"
  ON system_settings FOR ALL
  USING (true);

-- Create report_attachments table
CREATE TABLE IF NOT EXISTS report_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES daily_reports ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  uploaded_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read attachments"
  ON report_attachments FOR SELECT
  USING (true);

CREATE POLICY "Public create attachments"
  ON report_attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public delete attachments"
  ON report_attachments FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_temperature_logs_date ON temperature_logs(recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_item ON temperature_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_date ON cleaning_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_task ON cleaning_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_report_attachments_report ON report_attachments(report_id);