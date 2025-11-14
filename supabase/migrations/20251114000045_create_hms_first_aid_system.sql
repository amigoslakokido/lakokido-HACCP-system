/*
  # Create HMS First Aid System

  1. New Tables
    - `hms_first_aid_responsible`
      - `id` (uuid, primary key)
      - `name` (text) - Navn på førstehjelpsansvarlig
      - `email` (text) - E-post
      - `phone` (text) - Telefon
      - `department` (text) - Avdeling
      - `last_course_date` (date) - Siste kursdato
      - `certificate_url` (text) - URL til kursbevis PDF
      - `certificate_valid_until` (date) - Gyldig til dato
      - `status` (text) - Status (Gyldig/Utløpt/Utløper snart)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hms_first_aid_equipment`
      - `id` (uuid, primary key)
      - `equipment_name` (text) - Utstyrsnavn
      - `quantity` (integer) - Mengde
      - `condition` (text) - Tilstand (OK/Trenger utskiftning)
      - `notes` (text) - Notater
      - `last_check_date` (date) - Dato for siste kontroll
      - `checked_by` (text) - Hvem som utførte kontrollen
      - `image_url` (text) - URL til bilde av utstyret
      - `location` (text) - Plassering
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hms_first_aid_inspections`
      - `id` (uuid, primary key)
      - `inspection_date` (date) - Kontroll dato
      - `inspection_type` (text) - Type (Ukentlig/Månedlig)
      - `inspected_by` (text) - Kontrollert av
      - `missing_items` (text) - Mangler
      - `replaced_items` (text) - Utskiftede artikler
      - `comments` (text) - Kommentarer
      - `image_url` (text) - URL til bilde
      - `status` (text) - Status (OK/Mangler/Kritisk)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (HMS system is open)

  3. Indexes
    - Add indexes for faster queries
*/

-- First Aid Responsible Table
CREATE TABLE IF NOT EXISTS hms_first_aid_responsible (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  department text,
  last_course_date date,
  certificate_url text,
  certificate_valid_until date,
  status text DEFAULT 'Gyldig',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hms_first_aid_responsible ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to first aid responsible"
  ON hms_first_aid_responsible FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert access to first aid responsible"
  ON hms_first_aid_responsible FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update access to first aid responsible"
  ON hms_first_aid_responsible FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to first aid responsible"
  ON hms_first_aid_responsible FOR DELETE TO public USING (true);

-- First Aid Equipment Table
CREATE TABLE IF NOT EXISTS hms_first_aid_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_name text NOT NULL,
  quantity integer DEFAULT 0,
  condition text DEFAULT 'OK',
  notes text,
  last_check_date date,
  checked_by text,
  image_url text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hms_first_aid_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to first aid equipment"
  ON hms_first_aid_equipment FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert access to first aid equipment"
  ON hms_first_aid_equipment FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update access to first aid equipment"
  ON hms_first_aid_equipment FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to first aid equipment"
  ON hms_first_aid_equipment FOR DELETE TO public USING (true);

-- First Aid Inspections Table
CREATE TABLE IF NOT EXISTS hms_first_aid_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_date date NOT NULL,
  inspection_type text NOT NULL,
  inspected_by text NOT NULL,
  missing_items text,
  replaced_items text,
  comments text,
  image_url text,
  status text DEFAULT 'OK',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hms_first_aid_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to first aid inspections"
  ON hms_first_aid_inspections FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert access to first aid inspections"
  ON hms_first_aid_inspections FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update access to first aid inspections"
  ON hms_first_aid_inspections FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to first aid inspections"
  ON hms_first_aid_inspections FOR DELETE TO public USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_first_aid_equipment_condition ON hms_first_aid_equipment(condition);
CREATE INDEX IF NOT EXISTS idx_first_aid_equipment_last_check ON hms_first_aid_equipment(last_check_date);
CREATE INDEX IF NOT EXISTS idx_first_aid_inspections_date ON hms_first_aid_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_first_aid_inspections_type ON hms_first_aid_inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_first_aid_inspections_status ON hms_first_aid_inspections(status);
