/*
  # Add File Attachments to Critical Incidents

  1. New Tables
    - `incident_attachments` - Stores file/image attachments for incidents
      - `id` (uuid, primary key)
      - `incident_id` (uuid, foreign key to critical_incidents)
      - `file_name` (text) - Original file name
      - `file_url` (text) - URL to stored file
      - `file_type` (text) - MIME type (image/jpeg, image/png, application/pdf, etc.)
      - `file_size` (integer) - File size in bytes
      - `uploaded_by` (uuid, foreign key to employees)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on incident_attachments table
    - Add policies for public access
*/

-- Create incident_attachments table
CREATE TABLE IF NOT EXISTS incident_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES critical_incidents(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid REFERENCES employees(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Allow public read access to incident attachments"
  ON incident_attachments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert of incident attachments"
  ON incident_attachments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update of incident attachments"
  ON incident_attachments
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete of incident attachments"
  ON incident_attachments
  FOR DELETE
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident_id 
  ON incident_attachments(incident_id);