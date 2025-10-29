/*
  # Add time columns to log tables

  1. Changes
    - Add recorded_time column to temperature_logs table
    - This allows tracking specific times when temperature readings were taken
  
  2. Notes
    - Using TIME type for time-of-day storage
    - Defaults to current time
*/

-- Add recorded_time to temperature_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'temperature_logs' AND column_name = 'recorded_time'
  ) THEN
    ALTER TABLE temperature_logs ADD COLUMN recorded_time TIME DEFAULT CURRENT_TIME;
  END IF;
END $$;
