/*
  # Fix Duplicate RLS Policies

  1. Security Improvements
    - Remove duplicate RLS policies on incident_attachments table
    - Keep only one policy per action (SELECT, INSERT, DELETE)
    - Prevents confusion and potential security issues

  2. Changes
    - Drop old duplicate policies
    - Keep the clearer named policies

  3. Policies to Remove
    - "Allow public read access to incident attachments"
    - "Allow public insert of incident attachments"
    - "Allow public delete of incident attachments"

  4. Policies to Keep
    - "Public read incident attachments"
    - "Public create incident attachments"
    - "Public delete incident attachments"
*/

-- Drop old duplicate policies (if they exist)
DROP POLICY IF EXISTS "Allow public read access to incident attachments" ON incident_attachments;
DROP POLICY IF EXISTS "Allow public insert of incident attachments" ON incident_attachments;
DROP POLICY IF EXISTS "Allow public delete of incident attachments" ON incident_attachments;

-- Ensure we have the correct single policies (recreate if needed)
DROP POLICY IF EXISTS "Public read incident attachments" ON incident_attachments;
DROP POLICY IF EXISTS "Public create incident attachments" ON incident_attachments;
DROP POLICY IF EXISTS "Public delete incident attachments" ON incident_attachments;

-- Create single, clear policies
CREATE POLICY "Public read incident attachments"
  ON incident_attachments
  FOR SELECT
  USING (true);

CREATE POLICY "Public create incident attachments"
  ON incident_attachments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public delete incident attachments"
  ON incident_attachments
  FOR DELETE
  USING (true);