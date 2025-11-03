/*
  # Add Hygiene Checks, Cooling Logs, and Critical Incidents

  ## New Tables

  ### 1. `hygiene_checks`
  Daily hygiene verification for staff
  - `id` (uuid, PK)
  - `check_date` (date)
  - `staff_name` (text)
  - `uniform_clean` (boolean)
  - `hands_washed` (boolean)
  - `jewelry_removed` (boolean)
  - `illness_free` (boolean)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 2. `cooling_logs`
  Track food cooling process for safety
  - `id` (uuid, PK)
  - `product_name` (text)
  - `product_type` (text: 'meat', 'fish', 'poultry', 'other')
  - `initial_temp` (decimal)
  - `final_temp` (decimal)
  - `start_time` (timestamptz)
  - `end_time` (timestamptz)
  - `within_limits` (boolean)
  - `notes` (text)
  - `log_date` (date)
  - `created_at` (timestamptz)

  ### 3. `critical_incidents`
  Document and track critical food safety incidents
  - `id` (uuid, PK)
  - `title` (text)
  - `description` (text)
  - `severity` (text: 'critical', 'high', 'medium')
  - `status` (text: 'open', 'in_progress', 'resolved')
  - `incident_date` (date)
  - `ai_analysis` (text)
  - `ai_consequences` (text)
  - `ai_solutions` (text)
  - `reported_by` (uuid)
  - `resolved_by` (uuid)
  - `resolved_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `incident_attachments`
  Photos and documents for incidents
  - `id` (uuid, PK)
  - `incident_id` (uuid, FK)
  - `file_url` (text)
  - `file_name` (text)
  - `file_type` (text)
  - `uploaded_at` (timestamptz)

  ### 5. `dishwasher_logs`
  Track dishwasher temperature and sanitation
  - `id` (uuid, PK)
  - `log_date` (date)
  - `log_time` (time)
  - `temperature` (decimal)
  - `status` (text: 'safe', 'warning', 'danger')
  - `notes` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all new tables
  - Public access policies for all operations
*/

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

CREATE POLICY "Public read hygiene checks"
  ON hygiene_checks FOR SELECT
  USING (true);

CREATE POLICY "Public create hygiene checks"
  ON hygiene_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update hygiene checks"
  ON hygiene_checks FOR UPDATE
  USING (true);

CREATE POLICY "Public delete hygiene checks"
  ON hygiene_checks FOR DELETE
  USING (true);

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

CREATE POLICY "Public read cooling logs"
  ON cooling_logs FOR SELECT
  USING (true);

CREATE POLICY "Public create cooling logs"
  ON cooling_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update cooling logs"
  ON cooling_logs FOR UPDATE
  USING (true);

CREATE POLICY "Public delete cooling logs"
  ON cooling_logs FOR DELETE
  USING (true);

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

CREATE POLICY "Public read incidents"
  ON critical_incidents FOR SELECT
  USING (true);

CREATE POLICY "Public create incidents"
  ON critical_incidents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update incidents"
  ON critical_incidents FOR UPDATE
  USING (true);

CREATE POLICY "Public delete incidents"
  ON critical_incidents FOR DELETE
  USING (true);

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

CREATE POLICY "Public read incident attachments"
  ON incident_attachments FOR SELECT
  USING (true);

CREATE POLICY "Public create incident attachments"
  ON incident_attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public delete incident attachments"
  ON incident_attachments FOR DELETE
  USING (true);

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

CREATE POLICY "Public read dishwasher logs"
  ON dishwasher_logs FOR SELECT
  USING (true);

CREATE POLICY "Public create dishwasher logs"
  ON dishwasher_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update dishwasher logs"
  ON dishwasher_logs FOR UPDATE
  USING (true);

CREATE POLICY "Public delete dishwasher logs"
  ON dishwasher_logs FOR DELETE
  USING (true);

-- Add description column to cleaning_tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cleaning_tasks' AND column_name = 'description'
  ) THEN
    ALTER TABLE cleaning_tasks ADD COLUMN description text DEFAULT '';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hygiene_checks_date ON hygiene_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_cooling_logs_date ON cooling_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_critical_incidents_date ON critical_incidents(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_critical_incidents_status ON critical_incidents(status);
CREATE INDEX IF NOT EXISTS idx_dishwasher_logs_date ON dishwasher_logs(log_date DESC);