/*
  # Create HMS Fire Safety (Brannsikkerhet) System
  
  1. Purpose
    - Comprehensive fire safety management
    - Track fire safety equipment and inspections
    - Manage fire safety documentation
    - Ensure compliance with Norwegian fire safety regulations
  
  2. New Tables
    - `hms_fire_responsible`
      - Fire safety officer information
    - `hms_fire_equipment`
      - Fire safety equipment locations and status
    - `hms_fire_inspections`
      - Weekly, monthly, and annual fire safety checks
    - `hms_fire_documents`
      - Service reports, alarm tests, NORVA reports
    - `hms_fire_instructions`
      - Fire emergency procedures (Branninstruks)
    - `hms_fire_deviations`
      - Fire safety deviations linked to main deviation system
  
  3. Equipment Types
    - Brannslukker (Fire extinguisher)
    - Brannteppe (Fire blanket)
    - Brannalarm (Fire alarm)
    - Nødlys (Emergency lighting)
    - Røykvarsler (Smoke detector)
  
  4. Inspection Types
    - Ukentlig (Weekly)
    - Månedlig (Monthly)
    - Årlig (Annual by external company)
  
  5. Security
    - Enable RLS
    - Public access for restaurant operations
*/

-- Create fire responsible person table
CREATE TABLE IF NOT EXISTS hms_fire_responsible (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  last_course_date date,
  course_certificate_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fire equipment table
CREATE TABLE IF NOT EXISTS hms_fire_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type text NOT NULL CHECK (equipment_type IN (
    'Brannslukker',
    'Brannteppe',
    'Brannalarm',
    'Nødlys',
    'Røykvarsler'
  )),
  location text NOT NULL,
  description text,
  installation_date date,
  last_service_date date,
  next_service_date date,
  status text DEFAULT 'OK' CHECK (status IN ('OK', 'Trenger service', 'Defekt')),
  serial_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fire inspections table
CREATE TABLE IF NOT EXISTS hms_fire_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_type text NOT NULL CHECK (inspection_type IN ('Ukentlig', 'Månedlig', 'Årlig')),
  inspection_date date NOT NULL DEFAULT CURRENT_DATE,
  performed_by text NOT NULL,
  status text DEFAULT 'OK' CHECK (status IN ('OK', 'Ikke OK')),
  notes text,
  checklist_items jsonb,
  external_company text,
  report_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fire documents table
CREATE TABLE IF NOT EXISTS hms_fire_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL CHECK (document_type IN (
    'Service-rapport brannslukker',
    'Test brannalarm',
    'Rengjøring avtrekk',
    'NORVA-rapport',
    'Annet'
  )),
  document_name text NOT NULL,
  document_url text NOT NULL,
  document_date date NOT NULL,
  performed_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fire instructions table
CREATE TABLE IF NOT EXISTS hms_fire_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fire deviations table
CREATE TABLE IF NOT EXISTS hms_fire_deviations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES hms_fire_equipment(id) ON DELETE SET NULL,
  deviation_type text NOT NULL,
  description text NOT NULL,
  severity text CHECK (severity IN ('Lav', 'Middels', 'Høy', 'Kritisk')),
  corrective_action text,
  responsible_person text,
  deadline date,
  status text DEFAULT 'Åpen' CHECK (status IN ('Åpen', 'Under arbeid', 'Ferdig')),
  completed_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hms_fire_responsible ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_fire_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_fire_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_fire_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_fire_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_fire_deviations ENABLE ROW LEVEL SECURITY;

-- Create policies for fire_responsible
CREATE POLICY "Allow public access to fire_responsible"
  ON hms_fire_responsible FOR ALL TO public USING (true) WITH CHECK (true);

-- Create policies for fire_equipment
CREATE POLICY "Allow public access to fire_equipment"
  ON hms_fire_equipment FOR ALL TO public USING (true) WITH CHECK (true);

-- Create policies for fire_inspections
CREATE POLICY "Allow public access to fire_inspections"
  ON hms_fire_inspections FOR ALL TO public USING (true) WITH CHECK (true);

-- Create policies for fire_documents
CREATE POLICY "Allow public access to fire_documents"
  ON hms_fire_documents FOR ALL TO public USING (true) WITH CHECK (true);

-- Create policies for fire_instructions
CREATE POLICY "Allow public access to fire_instructions"
  ON hms_fire_instructions FOR ALL TO public USING (true) WITH CHECK (true);

-- Create policies for fire_deviations
CREATE POLICY "Allow public access to fire_deviations"
  ON hms_fire_deviations FOR ALL TO public USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fire_equipment_type ON hms_fire_equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_fire_equipment_status ON hms_fire_equipment(status);
CREATE INDEX IF NOT EXISTS idx_fire_inspections_date ON hms_fire_inspections(inspection_date DESC);
CREATE INDEX IF NOT EXISTS idx_fire_inspections_type ON hms_fire_inspections(inspection_type);
CREATE INDEX IF NOT EXISTS idx_fire_documents_date ON hms_fire_documents(document_date DESC);
CREATE INDEX IF NOT EXISTS idx_fire_deviations_status ON hms_fire_deviations(status);

-- Insert default fire responsible person
INSERT INTO hms_fire_responsible (name, phone, email, notes)
VALUES ('Ikke oppgitt', '', '', 'Oppdater brannansvarlig informasjon');

-- Insert example fire equipment
INSERT INTO hms_fire_equipment (equipment_type, location, description, installation_date, status) VALUES
  ('Brannslukker', 'Kjøkken - ved hovedinngang', '6kg pulverslukker', CURRENT_DATE - INTERVAL '1 year', 'OK'),
  ('Brannslukker', 'Kjøkken - ved stekebenk', '6kg pulverslukker', CURRENT_DATE - INTERVAL '1 year', 'OK'),
  ('Brannteppe', 'Kjøkken - ved frityr', 'Brannteppe 1,2m x 1,8m', CURRENT_DATE - INTERVAL '1 year', 'OK'),
  ('Brannalarm', 'Hovedkorridor', 'Brannalarm med sentral', CURRENT_DATE - INTERVAL '2 years', 'OK'),
  ('Nødlys', 'Alle utganger', 'Nødlys ved alle utganger', CURRENT_DATE - INTERVAL '2 years', 'OK'),
  ('Røykvarsler', 'Kjøkken', 'Optisk røykvarsler', CURRENT_DATE - INTERVAL '1 year', 'OK');

-- Insert default fire instructions
INSERT INTO hms_fire_instructions (title, content, order_number) VALUES
  (
    'Ved oppdagelse av brann',
    E'1. Varsle alle i bygget - rop "BRANN"\n2. Ring 110 og oppgi adressen\n3. Slukk brannen hvis det er trygt\n4. Lukk dører og vinduer\n5. Evakuer bygget',
    1
  ),
  (
    'Evakuering',
    E'1. Gå rolig mot nærmeste utgang\n2. Bruk IKKE heis\n3. Samles på oppsamlingsplassen\n4. Ikke gå tilbake inn i bygget\n5. Vent på beskjed fra brannvesenet',
    2
  ),
  (
    'Bruk av brannslukker',
    E'1. Trekk ut sikringspinnen\n2. Rett strålen mot bunnen av flammen\n3. Press inn håndtaket\n4. Sveip fra side til side\n5. Hold avstand på 2-3 meter',
    3
  ),
  (
    'Kontaktinformasjon',
    E'Brannvesen: 110\nPoliti: 112\nAmbulanse: 113\n\nBrannansvarlig: Se kontaktinfo i systemet\nByggets adresse: [Oppdater med deres adresse]',
    4
  );

-- Insert example inspection
INSERT INTO hms_fire_inspections (
  inspection_type,
  inspection_date,
  performed_by,
  status,
  notes,
  checklist_items
) VALUES (
  'Ukentlig',
  CURRENT_DATE,
  'HMS-ansvarlig',
  'OK',
  'Alle brannslukkere er på plass og synlige',
  '{"items": [
    {"name": "Brannslukkere er på plass", "status": "OK"},
    {"name": "Brannslukkere er synlige", "status": "OK"},
    {"name": "Rømningsveier er fri", "status": "OK"},
    {"name": "Nødlys fungerer", "status": "OK"}
  ]}'::jsonb
);
