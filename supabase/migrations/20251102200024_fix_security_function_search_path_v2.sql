/*
  # Fix Function Search Path Security Issue (v2)

  1. Security Improvements
    - Set immutable search_path for update_next_run function
    - Prevents search_path manipulation attacks
    - Follows PostgreSQL security best practices

  2. Changes
    - Drop trigger first, then function
    - Recreate function with secure search_path
    - Recreate trigger

  3. Notes
    - This prevents potential security vulnerabilities
    - Ensures function always uses the correct schema
*/

-- Drop trigger first
DROP TRIGGER IF EXISTS update_next_run_trigger ON scheduled_reports_config;

-- Drop function
DROP FUNCTION IF EXISTS update_next_run();

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION update_next_run()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.schedule_time IS NOT NULL AND NEW.schedule_time != OLD.schedule_time THEN
    NEW.next_run := (CURRENT_DATE + 1 + NEW.schedule_time::time)::timestamp;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_next_run_trigger
  BEFORE UPDATE ON scheduled_reports_config
  FOR EACH ROW
  EXECUTE FUNCTION update_next_run();