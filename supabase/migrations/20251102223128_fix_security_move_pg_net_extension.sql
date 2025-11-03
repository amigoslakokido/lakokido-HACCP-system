/*
  # Fix Security Issue - Move pg_net Extension

  ## Security Issue
  Extension `pg_net` is installed in the public schema, which is a security concern
  as it can be accessed by all users and may expose sensitive functionality.

  ## Solution
  Move the pg_net extension to the extensions schema where it belongs.
  This is a Supabase built-in extension that should be isolated from user tables.

  ## Impact
  - Improved security isolation
  - Follows Supabase best practices
  - Extension functionality remains available but in proper namespace
  
  ## Important Notes
  - The extensions schema is created by Supabase automatically
  - If pg_net is already in extensions schema, this will have no effect
  - Some Supabase projects may not allow moving this extension (managed by Supabase)
*/

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_net extension to extensions schema
-- Note: If this fails, it means Supabase manages it and we cannot move it
DO $$
BEGIN
  -- Check if pg_net exists in public schema
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_net' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Try to move it to extensions schema
    ALTER EXTENSION pg_net SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If we can't move it (permission denied), that's okay
    -- Supabase manages this extension
    RAISE NOTICE 'pg_net extension is managed by Supabase and cannot be moved';
END;
$$;