/*
  # Add Routine Task Completion Details Table

  ## Purpose
  Store detailed information about each task's completion status in daily routine reports.
  This allows reports to show exactly which tasks were completed and which were not.

  ## New Tables
  1. `routine_report_task_details`
     - `id` (uuid, primary key)
     - `report_id` (uuid) - Reference to daily_routine_reports
     - `task_id` (uuid) - Reference to routine_tasks
     - `task_name_ar` (text) - Arabic task name (snapshot)
     - `task_name_no` (text) - Norwegian task name (snapshot)
     - `task_icon` (text) - Task icon (snapshot)
     - `completed` (boolean) - Whether task was completed
     - `completed_at` (timestamptz) - When task was completed (if completed)
     - `created_at` (timestamptz) - When record was created

  ## Security
  - Enable RLS on table
  - Allow anyone to read task details
  - Allow anyone to insert task details
  - Allow anyone to update task details
  - Allow anyone to delete task details

  ## Indexes
  - Index on report_id for fast report-based queries
  - Index on task_id for task-based queries
  - Index on completed for filtering

  ## Notes
  - Task name and icon are stored as snapshots to preserve historical data
  - Even if task is renamed or deleted later, the report keeps original names
*/

-- Create routine_report_task_details table
CREATE TABLE IF NOT EXISTS routine_report_task_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES daily_routine_reports(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES routine_tasks(id) ON DELETE SET NULL,
  task_name_ar text NOT NULL DEFAULT '',
  task_name_no text NOT NULL DEFAULT '',
  task_icon text NOT NULL DEFAULT '📋',
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE routine_report_task_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read task details"
  ON routine_report_task_details FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert task details"
  ON routine_report_task_details FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update task details"
  ON routine_report_task_details FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete task details"
  ON routine_report_task_details FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_routine_task_details_report_id
  ON routine_report_task_details(report_id);

CREATE INDEX IF NOT EXISTS idx_routine_task_details_task_id
  ON routine_report_task_details(task_id);

CREATE INDEX IF NOT EXISTS idx_routine_task_details_completed
  ON routine_report_task_details(completed);

CREATE INDEX IF NOT EXISTS idx_routine_task_details_created_at
  ON routine_report_task_details(created_at DESC);
