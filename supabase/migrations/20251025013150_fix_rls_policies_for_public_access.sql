/*
  # Fix RLS Policies for Public Access

  ## Changes
  Remove authentication requirements since login has been removed.
  Allow anonymous access to all HACCP system tables.

  ## Security Note
  This makes the system accessible without authentication.
  All users can read and write data.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view active zones" ON temperature_zones;
DROP POLICY IF EXISTS "Admins can manage zones" ON temperature_zones;

DROP POLICY IF EXISTS "Anyone can view active items" ON temperature_items;
DROP POLICY IF EXISTS "Admins can manage items" ON temperature_items;

DROP POLICY IF EXISTS "Anyone can view temperature logs" ON temperature_logs;
DROP POLICY IF EXISTS "Staff can create temperature logs" ON temperature_logs;
DROP POLICY IF EXISTS "Admins and supervisors can update logs" ON temperature_logs;
DROP POLICY IF EXISTS "Admins can delete logs" ON temperature_logs;

DROP POLICY IF EXISTS "Anyone can view active tasks" ON cleaning_tasks;
DROP POLICY IF EXISTS "Admins can manage tasks" ON cleaning_tasks;

DROP POLICY IF EXISTS "Anyone can view cleaning logs" ON cleaning_logs;
DROP POLICY IF EXISTS "Staff can create and update cleaning logs" ON cleaning_logs;
DROP POLICY IF EXISTS "Staff can update own cleaning logs" ON cleaning_logs;
DROP POLICY IF EXISTS "Admins can delete cleaning logs" ON cleaning_logs;

DROP POLICY IF EXISTS "Anyone can view reports" ON daily_reports;
DROP POLICY IF EXISTS "Staff can create reports" ON daily_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON daily_reports;

DROP POLICY IF EXISTS "Anyone can view settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON system_settings;

DROP POLICY IF EXISTS "Anyone can view attachments" ON report_attachments;
DROP POLICY IF EXISTS "Staff can upload attachments" ON report_attachments;
DROP POLICY IF EXISTS "Admins can delete attachments" ON report_attachments;

-- Create new policies for anonymous access
CREATE POLICY "Allow all access to profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to temperature_zones"
  ON temperature_zones FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to temperature_items"
  ON temperature_items FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to temperature_logs"
  ON temperature_logs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to cleaning_tasks"
  ON cleaning_tasks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to cleaning_logs"
  ON cleaning_logs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to daily_reports"
  ON daily_reports FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to system_settings"
  ON system_settings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to report_attachments"
  ON report_attachments FOR ALL
  USING (true)
  WITH CHECK (true);
