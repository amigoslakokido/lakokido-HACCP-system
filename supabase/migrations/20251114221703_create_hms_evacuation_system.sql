/*
  # Create HMS Evacuation System

  1. New Tables
    - `hms_evacuation_plan`
      - `id` (uuid, primary key)
      - `warning_procedure` (text) - Varslingsprosedyre
      - `evacuation_procedure` (text) - Evakueringsprosedyre
      - `escape_routes` (text) - Rømningsveier
      - `assembly_point` (text) - Samlingspunkt
      - `post_evacuation_instructions` (text) - Instruksjoner etter evakuering
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hms_evacuation_roles`
      - `id` (uuid, primary key)
      - `role_type` (text) - 'evacuation_leader', 'fire_responsible', 'assembly_point_responsible'
      - `person_name` (text)
      - `phone` (text)
      - `department` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hms_escape_routes`
      - `id` (uuid, primary key)
      - `route_name` (text)
      - `description` (text)
      - `image_url` (text) - URL to uploaded image/drawing
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hms_evacuation_drills`
      - `id` (uuid, primary key)
      - `drill_date` (date)
      - `responsible_person` (text)
      - `participants` (text) - List of participants
      - `deviations` (text) - Avvik/forbedringspunkter
      - `media_url` (text) - URL to uploaded image/video
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hms_evacuation_documents`
      - `id` (uuid, primary key)
      - `document_type` (text) - 'escape_map', 'fire_department_report', 'other'
      - `document_name` (text)
      - `document_url` (text) - URL to uploaded PDF
      - `uploaded_by` (text)
      - `uploaded_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Create evacuation plan table (single row configuration)
CREATE TABLE IF NOT EXISTS hms_evacuation_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warning_procedure text DEFAULT '',
  evacuation_procedure text DEFAULT '',
  escape_routes text DEFAULT '',
  assembly_point text DEFAULT '',
  post_evacuation_instructions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create evacuation roles table
CREATE TABLE IF NOT EXISTS hms_evacuation_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type text NOT NULL CHECK (role_type IN ('evacuation_leader', 'fire_responsible', 'assembly_point_responsible')),
  person_name text NOT NULL,
  phone text DEFAULT '',
  department text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create escape routes table
CREATE TABLE IF NOT EXISTS hms_escape_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create evacuation drills table
CREATE TABLE IF NOT EXISTS hms_evacuation_drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_date date NOT NULL,
  responsible_person text NOT NULL,
  participants text DEFAULT '',
  deviations text DEFAULT '',
  media_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create evacuation documents table
CREATE TABLE IF NOT EXISTS hms_evacuation_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL CHECK (document_type IN ('escape_map', 'fire_department_report', 'other')),
  document_name text NOT NULL,
  document_url text NOT NULL,
  uploaded_by text DEFAULT '',
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hms_evacuation_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_evacuation_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_escape_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_evacuation_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_evacuation_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hms_evacuation_plan
CREATE POLICY "Users can view evacuation plan"
  ON hms_evacuation_plan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evacuation plan"
  ON hms_evacuation_plan FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evacuation plan"
  ON hms_evacuation_plan FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete evacuation plan"
  ON hms_evacuation_plan FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for hms_evacuation_roles
CREATE POLICY "Users can view evacuation roles"
  ON hms_evacuation_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evacuation roles"
  ON hms_evacuation_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evacuation roles"
  ON hms_evacuation_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete evacuation roles"
  ON hms_evacuation_roles FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for hms_escape_routes
CREATE POLICY "Users can view escape routes"
  ON hms_escape_routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert escape routes"
  ON hms_escape_routes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update escape routes"
  ON hms_escape_routes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete escape routes"
  ON hms_escape_routes FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for hms_evacuation_drills
CREATE POLICY "Users can view evacuation drills"
  ON hms_evacuation_drills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evacuation drills"
  ON hms_evacuation_drills FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evacuation drills"
  ON hms_evacuation_drills FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete evacuation drills"
  ON hms_evacuation_drills FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for hms_evacuation_documents
CREATE POLICY "Users can view evacuation documents"
  ON hms_evacuation_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evacuation documents"
  ON hms_evacuation_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evacuation documents"
  ON hms_evacuation_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete evacuation documents"
  ON hms_evacuation_documents FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_evacuation_roles_type ON hms_evacuation_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_evacuation_drills_date ON hms_evacuation_drills(drill_date);
CREATE INDEX IF NOT EXISTS idx_evacuation_documents_type ON hms_evacuation_documents(document_type);
