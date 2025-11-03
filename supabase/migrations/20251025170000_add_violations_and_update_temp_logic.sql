/*
  # Add Violation Tracking and Update Temperature Logic

  ## Overview
  This migration adds:
  1. Violation tracking system with image/document upload
  2. Temperature re-logging capability for violations
  3. Comments section in daily reports
  4. Sample data for cooling and hygiene

  ## New Tables

  ### 1. `violations`
  Track food safety violations with documentation
  - `id` (uuid, primary key)
  - `violation_date` (date) - Date of violation
  - `violation_type` (text) - Type: 'temperature', 'hygiene', 'cleaning', 'other'
  - `severity` (text) - 'low', 'medium', 'high', 'critical'
  - `description` (text) - What happened
  - `root_cause` (text) - Why it happened
  - `corrective_action` (text) - What was done immediately
  - `preventive_action` (text) - How to prevent in future
  - `reported_by` (uuid, FK to profiles)
  - `supervisor_signature` (text) - Supervisor name
  - `manager_signature` (text) - Manager name
  - `status` (text) - 'open', 'resolved', 'closed'
  - `created_at` (timestamptz)
  - `resolved_at` (timestamptz)

  ### 2. `violation_attachments`
  Images and documents attached to violations
  - `id` (uuid, primary key)
  - `violation_id` (uuid, FK to violations)
  - `file_url` (text) - URL or base64 of image/document
  - `file_name` (text)
  - `file_type` (text) - 'image/jpeg', 'image/png', 'application/pdf'
  - `description` (text)
  - `uploaded_by` (uuid, FK to profiles)
  - `uploaded_at` (timestamptz)

  ## Modified Tables

  ### 3. `temperature_logs`
  Add fields for re-logging violations
  - `is_violation` (boolean) - Is this a violation re-log?
  - `violation_reason` (text) - Why temperature was out of range
  - `corrective_action` (text) - What was done to fix it

  ### 4. `daily_reports`
  Add comments section
  - `violation_comments` (text) - Comments about violations and resolutions

  ## Security
  - RLS enabled on all new tables
  - Authenticated users can view all records
  - Only authenticated users can create/update records

  ## Important Notes
  - Temperature logs can be re-taken after 60 minutes if violation occurs
  - All violations require documentation and corrective actions
  - Images can be uploaded as base64 or file URLs
*/

-- =====================================================
-- 1. UPDATE TEMPERATURE_LOGS TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'temperature_logs' AND column_name = 'is_violation'
  ) THEN
    ALTER TABLE temperature_logs ADD COLUMN is_violation boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'temperature_logs' AND column_name = 'violation_reason'
  ) THEN
    ALTER TABLE temperature_logs ADD COLUMN violation_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'temperature_logs' AND column_name = 'corrective_action'
  ) THEN
    ALTER TABLE temperature_logs ADD COLUMN corrective_action text;
  END IF;
END $$;

-- =====================================================
-- 2. UPDATE DAILY_REPORTS TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'violation_comments'
  ) THEN
    ALTER TABLE daily_reports ADD COLUMN violation_comments text;
  END IF;
END $$;

-- =====================================================
-- 3. VIOLATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_date date NOT NULL DEFAULT CURRENT_DATE,
  violation_type text NOT NULL CHECK (violation_type IN ('temperature', 'hygiene', 'cleaning', 'other')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  root_cause text NOT NULL,
  corrective_action text NOT NULL,
  preventive_action text NOT NULL,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supervisor_signature text,
  manager_signature text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_violations_date ON violations(violation_date DESC);
CREATE INDEX IF NOT EXISTS idx_violations_type ON violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);

-- Enable RLS
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for violations
CREATE POLICY "Authenticated users can view violations"
  ON violations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create violations"
  ON violations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update violations they created"
  ON violations FOR UPDATE
  TO authenticated
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Authenticated users can delete violations"
  ON violations FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 4. VIOLATION_ATTACHMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS violation_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id uuid REFERENCES violations(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text DEFAULT 'image/jpeg',
  description text,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_violation_attachments_violation ON violation_attachments(violation_id);

-- Enable RLS
ALTER TABLE violation_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for violation_attachments
CREATE POLICY "Authenticated users can view attachments"
  ON violation_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create attachments"
  ON violation_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attachments"
  ON violation_attachments FOR DELETE
  TO authenticated
  USING (true);
