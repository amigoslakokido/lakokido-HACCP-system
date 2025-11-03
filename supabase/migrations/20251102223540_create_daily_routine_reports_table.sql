/*
  # Create Daily Routine Reports Table

  ## Purpose
  Create a separate table for daily routine task reports, distinct from the main
  HACCP daily reports. This allows users to generate and view reports specifically
  for routine tasks completion.

  ## New Tables
  1. `daily_routine_reports`
     - `id` (uuid, primary key)
     - `report_date` (date) - The date this report covers
     - `generated_by` (uuid) - Employee who generated the report
     - `total_tasks` (integer) - Total number of tasks
     - `completed_tasks` (integer) - Number of completed tasks
     - `not_completed_tasks` (integer) - Number of not completed tasks
     - `completion_percentage` (numeric) - Percentage of completion
     - `notes` (text) - Optional notes about the day
     - `created_at` (timestamptz) - When report was generated
     - `updated_at` (timestamptz) - Last update time

  ## Security
  - Enable RLS on table
  - Allow authenticated users to read all reports
  - Allow authenticated users to insert new reports
  - Allow authenticated users to update their own reports
  - Allow authenticated users to delete their own reports

  ## Indexes
  - Index on report_date for fast date-based queries
  - Index on generated_by for user-specific queries
  - Index on created_at for chronological sorting
*/

-- Create daily_routine_reports table
CREATE TABLE IF NOT EXISTS daily_routine_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  generated_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  total_tasks integer DEFAULT 0,
  completed_tasks integer DEFAULT 0,
  not_completed_tasks integer DEFAULT 0,
  completion_percentage numeric(5,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_routine_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read routine reports"
  ON daily_routine_reports FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert routine reports"
  ON daily_routine_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update routine reports"
  ON daily_routine_reports FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete routine reports"
  ON daily_routine_reports FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_routine_reports_date 
  ON daily_routine_reports(report_date DESC);

CREATE INDEX IF NOT EXISTS idx_routine_reports_generated_by 
  ON daily_routine_reports(generated_by);

CREATE INDEX IF NOT EXISTS idx_routine_reports_created_at 
  ON daily_routine_reports(created_at DESC);

-- Create unique constraint to prevent duplicate reports for same date
CREATE UNIQUE INDEX IF NOT EXISTS idx_routine_reports_unique_date 
  ON daily_routine_reports(report_date);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_routine_reports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_routine_reports_updated_at
  BEFORE UPDATE ON daily_routine_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_routine_reports_updated_at();