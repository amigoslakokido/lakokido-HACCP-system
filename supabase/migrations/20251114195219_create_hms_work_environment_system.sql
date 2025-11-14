/*
  # Create HMS Work Environment (Arbeidsmiljø) System
  
  1. Purpose
    - Comprehensive work environment assessment and monitoring
    - Track physical, ergonomic, and psychosocial factors
    - Document issues and improvement actions
    - Generate reports for HMS reviews
  
  2. New Tables
    - `hms_work_environment_assessments`
      - Main assessment records with status tracking
    - `hms_work_environment_items`
      - Individual assessment items (physical, ergonomic, psychosocial, etc.)
    - `hms_work_environment_deviations`
      - Track deviations/issues linked to assessments
  
  3. Categories
    - Fysiske forhold (Physical conditions)
    - Ergonomi (Ergonomics)
    - Psykososialt miljø (Psychosocial environment)
    - Verneutstyr (Safety equipment)
    - Rengjøring og hygiene (Cleaning and hygiene)
  
  4. Status Indicators
    - Green: All OK
    - Yellow: Some improvements needed
    - Red: Critical issues requiring immediate action
  
  5. Security
    - Enable RLS
    - Public access for restaurant operations
*/

-- Create main assessments table
CREATE TABLE IF NOT EXISTS hms_work_environment_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  assessed_by text NOT NULL,
  department text,
  overall_status text DEFAULT 'OK' CHECK (overall_status IN ('OK', 'Trenger forbedring', 'Kritisk')),
  notes text,
  action_plan text,
  next_review_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assessment items table
CREATE TABLE IF NOT EXISTS hms_work_environment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES hms_work_environment_assessments(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN (
    'Fysiske forhold',
    'Ergonomi',
    'Psykososialt miljø',
    'Verneutstyr',
    'Rengjøring og hygiene'
  )),
  item_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('OK', 'Trenger forbedring')),
  notes text,
  image_url text,
  priority text CHECK (priority IN ('Lav', 'Middels', 'Høy', 'Kritisk')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deviations table
CREATE TABLE IF NOT EXISTS hms_work_environment_deviations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES hms_work_environment_assessments(id) ON DELETE CASCADE,
  item_id uuid REFERENCES hms_work_environment_items(id) ON DELETE CASCADE,
  deviation_type text NOT NULL,
  description text NOT NULL,
  severity text CHECK (severity IN ('Lav', 'Middels', 'Høy', 'Kritisk')),
  corrective_action text,
  responsible_person text,
  deadline date,
  status text DEFAULT 'Åpen' CHECK (status IN ('Åpen', 'Under arbeid', 'Ferdig')),
  image_url text,
  completed_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hms_work_environment_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_work_environment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_work_environment_deviations ENABLE ROW LEVEL SECURITY;

-- Create policies for assessments
CREATE POLICY "Allow public read access to work environment assessments"
  ON hms_work_environment_assessments FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert access to work environment assessments"
  ON hms_work_environment_assessments FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update access to work environment assessments"
  ON hms_work_environment_assessments FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to work environment assessments"
  ON hms_work_environment_assessments FOR DELETE TO public USING (true);

-- Create policies for items
CREATE POLICY "Allow public read access to work environment items"
  ON hms_work_environment_items FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert access to work environment items"
  ON hms_work_environment_items FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update access to work environment items"
  ON hms_work_environment_items FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to work environment items"
  ON hms_work_environment_items FOR DELETE TO public USING (true);

-- Create policies for deviations
CREATE POLICY "Allow public read access to work environment deviations"
  ON hms_work_environment_deviations FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert access to work environment deviations"
  ON hms_work_environment_deviations FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update access to work environment deviations"
  ON hms_work_environment_deviations FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access to work environment deviations"
  ON hms_work_environment_deviations FOR DELETE TO public USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_env_assessments_date 
  ON hms_work_environment_assessments(assessment_date DESC);

CREATE INDEX IF NOT EXISTS idx_work_env_assessments_status 
  ON hms_work_environment_assessments(overall_status);

CREATE INDEX IF NOT EXISTS idx_work_env_items_assessment 
  ON hms_work_environment_items(assessment_id);

CREATE INDEX IF NOT EXISTS idx_work_env_items_category 
  ON hms_work_environment_items(category);

CREATE INDEX IF NOT EXISTS idx_work_env_deviations_assessment 
  ON hms_work_environment_deviations(assessment_id);

CREATE INDEX IF NOT EXISTS idx_work_env_deviations_status 
  ON hms_work_environment_deviations(status);

-- Insert example assessment with items
DO $$
DECLARE
  v_assessment_id uuid;
BEGIN
  -- Create sample assessment
  INSERT INTO hms_work_environment_assessments (
    assessment_date,
    assessed_by,
    department,
    overall_status,
    notes,
    action_plan,
    next_review_date
  ) VALUES (
    CURRENT_DATE,
    'HMS-ansvarlig',
    'Kjøkken',
    'Trenger forbedring',
    'Generell kartlegging av arbeidsmiljø. Noen forbedringsområder identifisert.',
    E'1. Forbedre ventilasjon i kjøkkenområdet\n2. Anskaffe nye ergonomiske matter\n3. Gjennomføre stresstoleransekurs',
    CURRENT_DATE + INTERVAL '6 months'
  )
  RETURNING id INTO v_assessment_id;

  -- Insert assessment items for Fysiske forhold
  INSERT INTO hms_work_environment_items (assessment_id, category, item_name, status, notes, priority) VALUES
    (v_assessment_id, 'Fysiske forhold', 'Temperatur i arbeidsområdet', 'OK', 'Temperatur er innenfor normale grenser', 'Lav'),
    (v_assessment_id, 'Fysiske forhold', 'Ventilasjon', 'Trenger forbedring', 'Ventilasjon ved stekebord kan forbedres', 'Høy'),
    (v_assessment_id, 'Fysiske forhold', 'Støynivå', 'OK', 'Akseptabelt støynivå', 'Lav'),
    (v_assessment_id, 'Fysiske forhold', 'Belysning', 'OK', 'God belysning i alle områder', 'Lav'),
    (v_assessment_id, 'Fysiske forhold', 'Luftkvalitet', 'Trenger forbedring', 'Luftkvalitet påvirkes av matlaging', 'Middels'),
    (v_assessment_id, 'Fysiske forhold', 'Plass og arbeidsplass', 'OK', 'Tilstrekkelig plass', 'Lav');

  -- Insert items for Ergonomi
  INSERT INTO hms_work_environment_items (assessment_id, category, item_name, status, notes, priority) VALUES
    (v_assessment_id, 'Ergonomi', 'Tungt løftearbeid', 'Trenger forbedring', 'Behov for mer hjelpemidler ved varemottak', 'Høy'),
    (v_assessment_id, 'Ergonomi', 'Arbeidsstilling', 'OK', 'God arbeidshøyde på benker', 'Lav'),
    (v_assessment_id, 'Ergonomi', 'Arbeidstempo', 'Trenger forbedring', 'Høyt tempo i rushperioder', 'Middels'),
    (v_assessment_id, 'Ergonomi', 'Repetitivt arbeid', 'OK', 'Variert arbeidsoppgaver', 'Lav'),
    (v_assessment_id, 'Ergonomi', 'Sklisikre matter', 'Trenger forbedring', 'Noen matter er slitt', 'Høy');

  -- Insert items for Psykososialt miljø
  INSERT INTO hms_work_environment_items (assessment_id, category, item_name, status, notes, priority) VALUES
    (v_assessment_id, 'Psykososialt miljø', 'Stressnivå', 'Trenger forbedring', 'Høyt stress i rushperioder', 'Høy'),
    (v_assessment_id, 'Psykososialt miljø', 'Samarbeid i teamet', 'OK', 'Godt samarbeid mellom ansatte', 'Lav'),
    (v_assessment_id, 'Psykososialt miljø', 'Pauser', 'OK', 'Regelmessige pauser sikres', 'Lav'),
    (v_assessment_id, 'Psykososialt miljø', 'Konflikthåndtering', 'OK', 'God kommunikasjon', 'Lav');

  -- Insert items for Verneutstyr
  INSERT INTO hms_work_environment_items (assessment_id, category, item_name, status, notes, priority) VALUES
    (v_assessment_id, 'Verneutstyr', 'Hansker tilgjengelig', 'OK', 'Tilstrekkelig med hansker', 'Lav'),
    (v_assessment_id, 'Verneutstyr', 'Sklisikre sko', 'OK', 'Alle ansatte har sklisikre sko', 'Lav'),
    (v_assessment_id, 'Verneutstyr', 'Uniform/arbeidstøy', 'OK', 'Godt vedlikeholdt arbeidstøy', 'Lav'),
    (v_assessment_id, 'Verneutstyr', 'Verneklær ved rengjøring', 'OK', 'Tilgjengelig ved behov', 'Lav');

  -- Insert items for Rengjøring og hygiene
  INSERT INTO hms_work_environment_items (assessment_id, category, item_name, status, notes, priority) VALUES
    (v_assessment_id, 'Rengjøring og hygiene', 'Generell renhold', 'OK', 'God renholdsstandard', 'Lav'),
    (v_assessment_id, 'Rengjøring og hygiene', 'Håndvask fasiliteter', 'OK', 'Tilstrekkelig antall', 'Lav'),
    (v_assessment_id, 'Rengjøring og hygiene', 'Avfallshåndtering', 'OK', 'God rutine for avfall', 'Lav'),
    (v_assessment_id, 'Rengjøring og hygiene', 'Kjemikalier oppbevaring', 'OK', 'Sikker oppbevaring', 'Lav');

  -- Insert sample deviations
  INSERT INTO hms_work_environment_deviations (
    assessment_id,
    deviation_type,
    description,
    severity,
    corrective_action,
    responsible_person,
    deadline,
    status
  ) VALUES
    (
      v_assessment_id,
      'Ventilasjon',
      'Utilstrekkelig ventilasjon ved stekebord fører til høy varme og røyk',
      'Høy',
      'Kontakte ventilasjonsfirma for inspeksjon og evt. oppgradering',
      'Daglig leder',
      CURRENT_DATE + INTERVAL '30 days',
      'Under arbeid'
    ),
    (
      v_assessment_id,
      'Ergonomi',
      'Gamle sklisikre matter er slitt og gir dårlig støtte',
      'Høy',
      'Bestille nye ergonomiske anti-fatigue matter',
      'Kjøkkensjef',
      CURRENT_DATE + INTERVAL '14 days',
      'Åpen'
    );
END $$;
