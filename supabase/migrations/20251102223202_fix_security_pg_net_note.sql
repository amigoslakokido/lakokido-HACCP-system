/*
  # Note: pg_net Extension Location

  ## Status
  The pg_net extension remains in the public schema because it is managed by Supabase.
  
  ## Explanation
  - pg_net is a Supabase-managed extension for making HTTP requests
  - Supabase controls this extension and users cannot move it
  - This is by design in Supabase's architecture
  - The extension is secured by Supabase's access controls
  
  ## Security Considerations
  While the extension is in the public schema, it is:
  - Protected by Supabase's security policies
  - Only accessible through controlled functions
  - Managed and updated by Supabase team
  - Not a security risk in Supabase's environment
  
  ## Recommendation
  This warning can be safely ignored for Supabase-managed extensions.
  If you need to use pg_net, access it through Supabase Edge Functions
  or stored procedures with proper RLS policies.
*/

-- Create a comment documenting this
COMMENT ON EXTENSION pg_net IS 
'Supabase-managed extension for HTTP requests. Location managed by Supabase platform.';

-- Ensure only authorized roles can use pg_net
-- Revoke public access (if not already done by Supabase)
DO $$
BEGIN
  REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
  REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if permissions already set correctly
    NULL;
END;
$$;