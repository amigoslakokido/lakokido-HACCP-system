/*
  # Fix Critical Incidents RLS Policies

  ## Changes
  - Allow unauthenticated users to create and manage critical incidents
  - Allow unauthenticated users to upload and manage attachments
  - Maintain read access for everyone

  ## Security Note
  This follows the same pattern as other tables in the system that allow
  unauthenticated access for ease of use in the HACCP system.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view critical incidents" ON critical_incidents;
DROP POLICY IF EXISTS "Authenticated users can create incidents" ON critical_incidents;
DROP POLICY IF EXISTS "Users can update incidents" ON critical_incidents;
DROP POLICY IF EXISTS "Users can delete own incidents" ON critical_incidents;

DROP POLICY IF EXISTS "Anyone can view attachments" ON incident_attachments;
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON incident_attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON incident_attachments;

-- New policies for critical_incidents allowing unauthenticated access

CREATE POLICY "Anyone can view critical incidents"
  ON critical_incidents
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create incidents"
  ON critical_incidents
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update incidents"
  ON critical_incidents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete incidents"
  ON critical_incidents
  FOR DELETE
  USING (true);

-- New policies for incident_attachments allowing unauthenticated access

CREATE POLICY "Anyone can view attachments"
  ON incident_attachments
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upload attachments"
  ON incident_attachments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update attachments"
  ON incident_attachments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete attachments"
  ON incident_attachments
  FOR DELETE
  USING (true);

-- Update storage policies for unauthenticated access
DROP POLICY IF EXISTS "Anyone can view incident files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload incident files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own incident files" ON storage.objects;

CREATE POLICY "Anyone can view incident files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'incident-files');

CREATE POLICY "Anyone can upload incident files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'incident-files');

CREATE POLICY "Anyone can update incident files"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'incident-files')
  WITH CHECK (bucket_id = 'incident-files');

CREATE POLICY "Anyone can delete incident files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'incident-files');
