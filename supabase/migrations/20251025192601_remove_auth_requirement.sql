/*
  # Remove Authentication Requirement

  This migration removes the authentication requirement from all tables
  by updating RLS policies to allow public access.

  ## Changes
  - Drop all existing restrictive policies
  - Create new public access policies for all operations
  - Keep RLS enabled for future use
*/

-- Cooling Logs: Drop old policies and create public ones
DROP POLICY IF EXISTS "Authenticated users can view cooling logs" ON cooling_logs;
DROP POLICY IF EXISTS "Authenticated users can create cooling logs" ON cooling_logs;
DROP POLICY IF EXISTS "Users can update cooling logs they created" ON cooling_logs;
DROP POLICY IF EXISTS "Authenticated users can delete cooling logs" ON cooling_logs;

CREATE POLICY "Public can view cooling logs"
  ON cooling_logs FOR SELECT
  USING (true);

CREATE POLICY "Public can create cooling logs"
  ON cooling_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update cooling logs"
  ON cooling_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete cooling logs"
  ON cooling_logs FOR DELETE
  USING (true);

-- Hygiene Checks: Drop old policies and create public ones
DROP POLICY IF EXISTS "Authenticated users can view hygiene checks" ON hygiene_checks;
DROP POLICY IF EXISTS "Authenticated users can create hygiene checks" ON hygiene_checks;
DROP POLICY IF EXISTS "Users can update hygiene checks they created" ON hygiene_checks;
DROP POLICY IF EXISTS "Authenticated users can delete hygiene checks" ON hygiene_checks;

CREATE POLICY "Public can view hygiene checks"
  ON hygiene_checks FOR SELECT
  USING (true);

CREATE POLICY "Public can create hygiene checks"
  ON hygiene_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update hygiene checks"
  ON hygiene_checks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete hygiene checks"
  ON hygiene_checks FOR DELETE
  USING (true);

-- Update other tables as well
-- Temperature Zones
DROP POLICY IF EXISTS "Anyone can view temperature zones" ON temperature_zones;
DROP POLICY IF EXISTS "Only authenticated users can manage temperature zones" ON temperature_zones;

CREATE POLICY "Public can view temperature zones"
  ON temperature_zones FOR SELECT
  USING (true);

CREATE POLICY "Public can manage temperature zones"
  ON temperature_zones FOR ALL
  USING (true)
  WITH CHECK (true);

-- Temperature Logs
DROP POLICY IF EXISTS "Anyone can view temperature logs" ON temperature_logs;
DROP POLICY IF EXISTS "Only authenticated users can create temperature logs" ON temperature_logs;

CREATE POLICY "Public can view temperature logs"
  ON temperature_logs FOR SELECT
  USING (true);

CREATE POLICY "Public can create temperature logs"
  ON temperature_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update temperature logs"
  ON temperature_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete temperature logs"
  ON temperature_logs FOR DELETE
  USING (true);

-- Cleaning Tasks
DROP POLICY IF EXISTS "Anyone can view cleaning tasks" ON cleaning_tasks;
DROP POLICY IF EXISTS "Only authenticated users can manage cleaning tasks" ON cleaning_tasks;

CREATE POLICY "Public can view cleaning tasks"
  ON cleaning_tasks FOR SELECT
  USING (true);

CREATE POLICY "Public can manage cleaning tasks"
  ON cleaning_tasks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cleaning Logs
DROP POLICY IF EXISTS "Anyone can view cleaning logs" ON cleaning_logs;
DROP POLICY IF EXISTS "Only authenticated users can create cleaning logs" ON cleaning_logs;

CREATE POLICY "Public can view cleaning logs"
  ON cleaning_logs FOR SELECT
  USING (true);

CREATE POLICY "Public can create cleaning logs"
  ON cleaning_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update cleaning logs"
  ON cleaning_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete cleaning logs"
  ON cleaning_logs FOR DELETE
  USING (true);

-- Profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Public can manage profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Daily Reports
DROP POLICY IF EXISTS "Anyone can view daily reports" ON daily_reports;
DROP POLICY IF EXISTS "Only authenticated users can manage daily reports" ON daily_reports;

CREATE POLICY "Public can view daily reports"
  ON daily_reports FOR SELECT
  USING (true);

CREATE POLICY "Public can manage daily reports"
  ON daily_reports FOR ALL
  USING (true)
  WITH CHECK (true);

-- Violation Reports
DROP POLICY IF EXISTS "Anyone can view violation reports" ON violation_reports;
DROP POLICY IF EXISTS "Only authenticated users can create violation reports" ON violation_reports;

CREATE POLICY "Public can view violation reports"
  ON violation_reports FOR SELECT
  USING (true);

CREATE POLICY "Public can create violation reports"
  ON violation_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update violation reports"
  ON violation_reports FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete violation reports"
  ON violation_reports FOR DELETE
  USING (true);
