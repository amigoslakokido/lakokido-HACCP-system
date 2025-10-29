/*
  # Create LA kokido HACCP Management System Database

  1. New Tables
    - `profiles` - User profiles
    - `employees` - Restaurant staff
    - `zones` - Kitchen zones (storage, preparation, cooking, etc.)
    - `equipment` - Refrigerators, freezers, and other equipment
    - `cleaning_tasks` - Scheduled cleaning tasks
    - `cleaning_logs` - Cleaning task completion records
    - `temperature_logs` - Equipment temperature monitoring
    - `cooling_logs` - Food cooling process tracking
    - `hygiene_checks` - Staff hygiene verification
    - `dishwasher_logs` - Dishwasher sanitation tracking
    - `critical_incidents` - Food safety incidents
    - `incident_attachments` - Incident documentation
    - `daily_reports` - Generated daily reports

  2. Security
    - Enable RLS on all tables
    - Public access policies for all operations (no authentication required)

  3. Notes
    - All data starts empty for LA kokido to populate
    - Company name: LA kokido
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public create profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Public delete profiles" ON profiles FOR DELETE USING (true);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Public create employees" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update employees" ON employees FOR UPDATE USING (true);
CREATE POLICY "Public delete employees" ON employees FOR DELETE USING (true);

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read zones" ON zones FOR SELECT USING (true);
CREATE POLICY "Public create zones" ON zones FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update zones" ON zones FOR UPDATE USING (true);
CREATE POLICY "Public delete zones" ON zones FOR DELETE USING (true);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('refrigerator', 'freezer', 'other')) DEFAULT 'refrigerator',
  zone_id uuid REFERENCES zones ON DELETE SET NULL,
  min_temp decimal(5,2) NOT NULL DEFAULT -18,
  max_temp decimal(5,2) NOT NULL DEFAULT 4,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Public create equipment" ON equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update equipment" ON equipment FOR UPDATE USING (true);
CREATE POLICY "Public delete equipment" ON equipment FOR DELETE USING (true);

-- Create cleaning_tasks table
CREATE TABLE IF NOT EXISTS cleaning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES zones ON DELETE CASCADE,
  task_name text NOT NULL,
  description text DEFAULT '',
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cleaning tasks" ON cleaning_tasks FOR SELECT USING (true);
CREATE POLICY "Public create cleaning tasks" ON cleaning_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update cleaning tasks" ON cleaning_tasks FOR UPDATE USING (true);
CREATE POLICY "Public delete cleaning tasks" ON cleaning_tasks FOR DELETE USING (true);

-- Create cleaning_logs table
CREATE TABLE IF NOT EXISTS cleaning_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES cleaning_tasks ON DELETE CASCADE,
  completed_by uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  log_time time NOT NULL DEFAULT CURRENT_TIME,
  status text NOT NULL CHECK (status IN ('completed', 'incomplete', 'skipped')) DEFAULT 'completed',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cleaning logs" ON cleaning_logs FOR SELECT USING (true);
CREATE POLICY "Public create cleaning logs" ON cleaning_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update cleaning logs" ON cleaning_logs FOR UPDATE USING (true);
CREATE POLICY "Public delete cleaning logs" ON cleaning_logs FOR DELETE USING (true);

-- Create temperature_logs table
CREATE TABLE IF NOT EXISTS temperature_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment ON DELETE CASCADE,
  temperature decimal(5,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('safe', 'warning', 'danger')) DEFAULT 'safe',
  recorded_by uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  log_time time NOT NULL DEFAULT CURRENT_TIME,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE temperature_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read temperature logs" ON temperature_logs FOR SELECT USING (true);
CREATE POLICY "Public create temperature logs" ON temperature_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update temperature logs" ON temperature_logs FOR UPDATE USING (true);
CREATE POLICY "Public delete temperature logs" ON temperature_logs FOR DELETE USING (true);

-- Create hygiene_checks table
CREATE TABLE IF NOT EXISTS hygiene_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  staff_name text NOT NULL,
  uniform_clean boolean NOT NULL DEFAULT false,
  hands_washed boolean NOT NULL DEFAULT false,
  jewelry_removed boolean NOT NULL DEFAULT false,
  illness_free boolean NOT NULL DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hygiene_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hygiene checks" ON hygiene_checks FOR SELECT USING (true);
CREATE POLICY "Public create hygiene checks" ON hygiene_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update hygiene checks" ON hygiene_checks FOR UPDATE USING (true);
CREATE POLICY "Public delete hygiene checks" ON hygiene_checks FOR DELETE USING (true);

-- Create cooling_logs table
CREATE TABLE IF NOT EXISTS cooling_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('meat', 'fish', 'poultry', 'other')) DEFAULT 'other',
  initial_temp decimal(5,2) NOT NULL,
  final_temp decimal(5,2) NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  within_limits boolean NOT NULL DEFAULT true,
  notes text DEFAULT '',
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cooling_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cooling logs" ON cooling_logs FOR SELECT USING (true);
CREATE POLICY "Public create cooling logs" ON cooling_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update cooling logs" ON cooling_logs FOR UPDATE USING (true);
CREATE POLICY "Public delete cooling logs" ON cooling_logs FOR DELETE USING (true);

-- Create critical_incidents table
CREATE TABLE IF NOT EXISTS critical_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium')) DEFAULT 'medium',
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  ai_analysis text DEFAULT '',
  ai_consequences text DEFAULT '',
  ai_solutions text DEFAULT '',
  reported_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE critical_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read incidents" ON critical_incidents FOR SELECT USING (true);
CREATE POLICY "Public create incidents" ON critical_incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update incidents" ON critical_incidents FOR UPDATE USING (true);
CREATE POLICY "Public delete incidents" ON critical_incidents FOR DELETE USING (true);

-- Create incident_attachments table
CREATE TABLE IF NOT EXISTS incident_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES critical_incidents ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read incident attachments" ON incident_attachments FOR SELECT USING (true);
CREATE POLICY "Public create incident attachments" ON incident_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete incident attachments" ON incident_attachments FOR DELETE USING (true);

-- Create dishwasher_logs table
CREATE TABLE IF NOT EXISTS dishwasher_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  log_time time NOT NULL DEFAULT CURRENT_TIME,
  temperature decimal(5,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('safe', 'warning', 'danger')) DEFAULT 'safe',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dishwasher_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read dishwasher logs" ON dishwasher_logs FOR SELECT USING (true);
CREATE POLICY "Public create dishwasher logs" ON dishwasher_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update dishwasher logs" ON dishwasher_logs FOR UPDATE USING (true);
CREATE POLICY "Public delete dishwasher logs" ON dishwasher_logs FOR DELETE USING (true);

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL UNIQUE,
  generated_by uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read daily reports" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Public create daily reports" ON daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update daily reports" ON daily_reports FOR UPDATE USING (true);
CREATE POLICY "Public delete daily reports" ON daily_reports FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(active);
CREATE INDEX IF NOT EXISTS idx_equipment_zone ON equipment(zone_id);
CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment(active);
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_date ON cleaning_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_date ON temperature_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_temperature_logs_equipment ON temperature_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_hygiene_checks_date ON hygiene_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_cooling_logs_date ON cooling_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_critical_incidents_date ON critical_incidents(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_critical_incidents_status ON critical_incidents(status);
CREATE INDEX IF NOT EXISTS idx_dishwasher_logs_date ON dishwasher_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date DESC);