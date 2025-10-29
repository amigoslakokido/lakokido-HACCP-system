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
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'supervisor', 'staff')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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

CREATE POLICY "Anyone can view active zones"
  ON temperature_zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage zones"
  ON temperature_zones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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

CREATE POLICY "Anyone can view active items"
  ON temperature_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage items"
  ON temperature_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create temperature_logs table
CREATE TABLE IF NOT EXISTS temperature_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES temperature_items ON DELETE CASCADE,
  recorded_temp decimal(5,2) NOT NULL,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('safe', 'warning', 'danger')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE temperature_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view temperature logs"
  ON temperature_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create temperature logs"
  ON temperature_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recorded_by);

CREATE POLICY "Admins and supervisors can update logs"
  ON temperature_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can delete logs"
  ON temperature_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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

CREATE POLICY "Anyone can view active tasks"
  ON cleaning_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tasks"
  ON cleaning_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create cleaning_logs table
CREATE TABLE IF NOT EXISTS cleaning_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES cleaning_tasks ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  is_completed boolean DEFAULT false,
  completed_by uuid REFERENCES profiles ON DELETE SET NULL,
  completed_at timestamptz,
  notes text DEFAULT ''
);

ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cleaning logs"
  ON cleaning_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create and update cleaning logs"
  ON cleaning_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update own cleaning logs"
  ON cleaning_logs FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete cleaning logs"
  ON cleaning_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL UNIQUE,
  pdf_url text,
  overall_status text NOT NULL CHECK (overall_status IN ('safe', 'warning', 'danger')),
  generated_by uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  generated_at timestamptz DEFAULT now(),
  notes text DEFAULT ''
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reports"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create reports"
  ON daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = generated_by);

CREATE POLICY "Admins can delete reports"
  ON daily_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_by uuid REFERENCES profiles ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create report_attachments table
CREATE TABLE IF NOT EXISTS report_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES daily_reports ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments"
  ON report_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can upload attachments"
  ON report_attachments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can delete attachments"
  ON report_attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_temperature_logs_date ON temperature_logs(recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_item ON temperature_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_date ON cleaning_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_task ON cleaning_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_report_attachments_report ON report_attachments(report_id);
