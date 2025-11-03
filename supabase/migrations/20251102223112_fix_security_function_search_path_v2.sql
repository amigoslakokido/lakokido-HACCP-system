/*
  # Fix Security Issue - Function Search Path (v2)

  ## Security Issue
  Function `update_notification_settings_updated_at` has a mutable search_path,
  which can lead to security vulnerabilities where malicious users could hijack
  function behavior by creating objects in schemas that appear earlier in the
  search path.

  ## Solution
  Set the search_path to an empty string for the function to ensure it only
  references fully qualified object names (schema.object).

  ## Impact
  - Prevents search_path hijacking attacks
  - Ensures function always uses explicitly qualified names
  - No functional changes to the application
*/

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS update_notification_settings_timestamp ON notification_settings;
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;

-- Drop the existing function with CASCADE to remove dependencies
DROP FUNCTION IF EXISTS update_notification_settings_updated_at() CASCADE;

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
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

-- Recreate the trigger
CREATE TRIGGER update_notification_settings_timestamp
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();