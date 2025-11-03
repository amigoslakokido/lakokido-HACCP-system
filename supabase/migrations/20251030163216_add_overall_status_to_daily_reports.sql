/*
  # Add overall_status to daily_reports

  1. Changes
    - Add overall_status column to daily_reports table
    - Values: 'safe', 'warning', 'danger'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_reports' AND column_name = 'overall_status'
  ) THEN
    ALTER TABLE daily_reports ADD COLUMN overall_status text DEFAULT 'safe';
  END IF;
END $$;