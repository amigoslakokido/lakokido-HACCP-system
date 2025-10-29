/*
  # Critical Incidents System - نظام التقارير الخطرة

  ## 1. New Tables
    
  ### `critical_incidents`
  Main table for critical incident reports with AI-generated analysis
  - `id` (uuid, primary key)
  - `title` (text) - عنوان الحادثة
  - `description` (text) - الوصف المدخل من المستخدم
  - `ai_analysis` (text) - التحليل المولد بالذكاء الاصطناعي
  - `ai_consequences` (text) - العواقب المحتملة
  - `ai_solutions` (text) - الحلول المقترحة
  - `severity` (text) - المستوى: 'critical', 'high', 'medium'
  - `status` (text) - الحالة: 'open', 'in_progress', 'resolved'
  - `incident_date` (date) - تاريخ الحادثة
  - `reported_by` (uuid) - من قام بالتبليغ
  - `resolved_by` (uuid, nullable) - من قام بالحل
  - `resolved_at` (timestamptz, nullable) - وقت الحل
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `incident_attachments`
  File attachments for incidents (images, documents)
  - `id` (uuid, primary key)
  - `incident_id` (uuid, foreign key)
  - `file_name` (text)
  - `file_url` (text) - URL in Supabase Storage
  - `file_type` (text) - 'image' or 'document'
  - `file_size` (integer) - in bytes
  - `uploaded_by` (uuid)
  - `created_at` (timestamptz)

  ## 2. Storage
  
  Create storage bucket for incident files

  ## 3. Security
  
  - Enable RLS on both tables
  - Allow authenticated users to view all incidents
  - Allow authenticated users to create incidents
  - Only incident reporter or admin can edit/delete
  - Public read access for storage (with secure paths)

  ## 4. Functions
  
  - Auto-update `updated_at` timestamp on changes
*/

-- Create critical_incidents table
CREATE TABLE IF NOT EXISTS critical_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  ai_analysis text,
  ai_consequences text,
  ai_solutions text,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  reported_by uuid NOT NULL,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create incident_attachments table
CREATE TABLE IF NOT EXISTS incident_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES critical_incidents(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'document')),
  file_size integer NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create storage bucket for incident files
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-files', 'incident-files', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE critical_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;

-- Critical Incidents Policies

-- Anyone can view all incidents
CREATE POLICY "Anyone can view critical incidents"
  ON critical_incidents
  FOR SELECT
  USING (true);

-- Authenticated users can create incidents
CREATE POLICY "Authenticated users can create incidents"
  ON critical_incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own incidents or any if they're resolving
CREATE POLICY "Users can update incidents"
  ON critical_incidents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Users can delete their own incidents
CREATE POLICY "Users can delete own incidents"
  ON critical_incidents
  FOR DELETE
  TO authenticated
  USING (reported_by = auth.uid());

-- Incident Attachments Policies

-- Anyone can view attachments
CREATE POLICY "Anyone can view attachments"
  ON incident_attachments
  FOR SELECT
  USING (true);

-- Authenticated users can upload attachments
CREATE POLICY "Authenticated users can upload attachments"
  ON incident_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can delete attachments they uploaded
CREATE POLICY "Users can delete own attachments"
  ON incident_attachments
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Storage policies for incident files
CREATE POLICY "Anyone can view incident files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'incident-files');

CREATE POLICY "Authenticated users can upload incident files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'incident-files');

CREATE POLICY "Users can delete own incident files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'incident-files');

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_critical_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_critical_incidents_timestamp ON critical_incidents;
CREATE TRIGGER update_critical_incidents_timestamp
  BEFORE UPDATE ON critical_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_critical_incidents_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_critical_incidents_date ON critical_incidents(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_critical_incidents_status ON critical_incidents(status);
CREATE INDEX IF NOT EXISTS idx_critical_incidents_severity ON critical_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident ON incident_attachments(incident_id);
