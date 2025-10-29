/*
  # Add Time Tracking to Temperature and Cleaning Logs

  ## Changes
  1. Add time columns to temperature_logs
     - `recorded_time` (time) - Time when temperature was recorded
  
  2. Add time columns to cleaning_logs
     - `completed_time` (time) - Time when task was completed
  
  ## Purpose
  Enable precise time tracking for compliance and audit trails
*/

-- Add time column to temperature_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'temperature_logs' AND column_name = 'recorded_time'
  ) THEN
    ALTER TABLE temperature_logs ADD COLUMN recorded_time time DEFAULT CURRENT_TIME;
  END IF;
END $$;

-- Add time column to cleaning_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cleaning_logs' AND column_name = 'completed_time'
  ) THEN
    ALTER TABLE cleaning_logs ADD COLUMN completed_time time;
  END IF;
END $$;