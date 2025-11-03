/*
  # Add Personal Hygiene, Cooling Log, and Auto-Report Features

  ## Overview
  This migration adds three major features to the HACCP system:
  1. Personal hygiene tracking for staff compliance
  2. Cooling log category for post-cooking temperature monitoring
  3. Auto-generated daily reports with settings control

  ## New Tables

  ### 1. `hygiene_checks`
  Daily personal hygiene compliance checks for staff
  - `id` (uuid, primary key)
  - `check_date` (date) - Date of hygiene check
  - `checked_by` (uuid, FK to profiles) - Staff member checked
  - `checker_id` (uuid, FK to profiles) - Supervisor performing check
  - `uniform_ok` (boolean) - Uniform/dress code compliance
  - `gloves_ok` (boolean) - Proper glove usage
  - `handwashing_ok` (boolean) - Hand washing compliance
  - `nails_ok` (boolean) - Nail hygiene (short, clean)
  - `hair_ok` (boolean) - Hair covered/contained properly
  - `overall_status` (text) - 'OK' or 'Ikke OK'
  - `notes` (text) - Additional comments
  - `created_at` (timestamptz)

  ### 2. `cooling_logs`
  Temperature tracking for hot foods during cooling process
  - `id` (uuid, primary key)
  - `log_date` (date) - Date of cooling process
  - `product_name` (text) - Name of dish/product being cooled
  - `temp_initial` (decimal) - Temperature at start (0 hours)
  - `temp_2h` (decimal) - Temperature after 2 hours
  - `temp_6h` (decimal) - Temperature after 6 hours
  - `total_duration_hours` (decimal) - Total cooling time
  - `recorded_by` (uuid, FK to profiles)
  - `status` (text) - 'safe', 'warning', 'danger'
  - `notes` (text)
  - `created_at` (timestamptz)

  ## Modified Tables

  ### 3. `system_settings`
  Add new settings:
  - `auto_generate_daily_report` (boolean) - Enable/disable auto-report generation
  - `cooling_temp_thresholds` (jsonb) - Min/max temps for cooling stages

  ## Security
  - RLS enabled on all new tables
  - Authenticated users can view all records
  - Only authenticated users can create/update records
  - Users can only update their own created records

  ## Important Notes
  - All hygiene checks default to false (not OK) for safety
  - Cooling logs track critical food safety temperatures
  - Auto-report generation can be toggled in settings
*/

-- =====================================================
-- 1. HYGIENE CHECKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS hygiene_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  checked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  checker_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  uniform_ok boolean DEFAULT false,
  gloves_ok boolean DEFAULT false,
  handwashing_ok boolean DEFAULT false,
  nails_ok boolean DEFAULT false,
  hair_ok boolean DEFAULT false,
  overall_status text DEFAULT 'Ikke OK' CHECK (overall_status IN ('OK', 'Ikke OK')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_hygiene_checks_date ON hygiene_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_hygiene_checks_checked_by ON hygiene_checks(checked_by);

-- Enable RLS
ALTER TABLE hygiene_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hygiene_checks
CREATE POLICY "Authenticated users can view hygiene checks"
  ON hygiene_checks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create hygiene checks"
  ON hygiene_checks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update hygiene checks they created"
  ON hygiene_checks FOR UPDATE
  TO authenticated
  USING (checker_id = auth.uid())
  WITH CHECK (checker_id = auth.uid());

CREATE POLICY "Authenticated users can delete hygiene checks"
  ON hygiene_checks FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 2. COOLING LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cooling_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  product_name text NOT NULL,
  temp_initial decimal(5,2),
  temp_2h decimal(5,2),
  temp_6h decimal(5,2),
  total_duration_hours decimal(4,2),
  recorded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'safe' CHECK (status IN ('safe', 'warning', 'danger')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cooling_logs_date ON cooling_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_cooling_logs_status ON cooling_logs(status);

-- Enable RLS
ALTER TABLE cooling_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cooling_logs
CREATE POLICY "Authenticated users can view cooling logs"
  ON cooling_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create cooling logs"
  ON cooling_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cooling logs they created"
  ON cooling_logs FOR UPDATE
  TO authenticated
  USING (recorded_by = auth.uid())
  WITH CHECK (recorded_by = auth.uid());

CREATE POLICY "Authenticated users can delete cooling logs"
  ON cooling_logs FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 3. ADD NEW SYSTEM SETTINGS
-- =====================================================

-- Insert auto-report generation setting
INSERT INTO system_settings (setting_key, setting_value)
VALUES ('auto_generate_daily_report', '{"enabled": false, "generation_time": "23:00"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert cooling temperature thresholds
INSERT INTO system_settings (setting_key, setting_value)
VALUES ('cooling_temp_thresholds', '{
  "initial_max": 60,
  "temp_2h_max": 21,
  "temp_6h_max": 5,
  "safe_threshold": 5,
  "warning_threshold": 8,
  "danger_threshold": 10
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 4. UPDATE DAILY REPORTS TABLE (if needed)
-- =====================================================

-- Add auto_generated flag to daily_reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'auto_generated'
  ) THEN
    ALTER TABLE daily_reports ADD COLUMN auto_generated boolean DEFAULT false;
  END IF;
END $$;

-- Add index for auto-generated reports
CREATE INDEX IF NOT EXISTS idx_daily_reports_auto_generated ON daily_reports(auto_generated);
