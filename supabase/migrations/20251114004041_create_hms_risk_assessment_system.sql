/*
  # Create HMS Risk Assessment (Risikoanalyse) System
  
  1. Purpose
    - Create comprehensive risk assessment system for restaurants
    - Track hazards, evaluate risks, and manage preventive actions
    - Comply with Arbeidstilsynet requirements
    - Part of annual HMS review
  
  2. New Tables
    - `hms_risk_assessments`
      - `id` (uuid, primary key)
      - `hazard_type` (text) - Type of hazard
      - `hazard_description` (text) - Description of the risk
      - `likelihood` (integer 1-5) - Sannsynlighet (probability)
      - `consequence` (integer 1-5) - Konsekvens (severity)
      - `risk_score` (integer, calculated) - likelihood × consequence
      - `risk_level` (text) - Lav/Middels/Høy/Kritisk
      - `preventive_measures` (text) - Tiltak
      - `responsible_person` (text) - Ansvarlig
      - `deadline` (date) - Frist
      - `status` (text) - Åpen/Under arbeid/Ferdig
      - `image_before_url` (text) - Image of hazard location
      - `image_after_url` (text) - Image after measures implemented
      - `notes` (text) - Additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (text)
      - `last_reviewed_date` (date)
  
  3. Security
    - Enable RLS
    - Public access for authenticated operations (restaurant staff)
  
  4. Risk Matrix
    - 1-4: Lav (Low) - Green
    - 5-9: Middels (Medium) - Yellow
    - 10-15: Høy (High) - Orange
    - 16-25: Kritisk (Critical) - Red
*/

-- Create risk assessments table
CREATE TABLE IF NOT EXISTS hms_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_type text NOT NULL,
  hazard_description text NOT NULL,
  likelihood integer NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
  consequence integer NOT NULL CHECK (consequence >= 1 AND consequence <= 5),
  risk_score integer GENERATED ALWAYS AS (likelihood * consequence) STORED,
  risk_level text GENERATED ALWAYS AS (
    CASE 
      WHEN (likelihood * consequence) <= 4 THEN 'Lav'
      WHEN (likelihood * consequence) <= 9 THEN 'Middels'
      WHEN (likelihood * consequence) <= 15 THEN 'Høy'
      ELSE 'Kritisk'
    END
  ) STORED,
  preventive_measures text NOT NULL,
  responsible_person text NOT NULL,
  deadline date,
  status text DEFAULT 'Åpen' CHECK (status IN ('Åpen', 'Under arbeid', 'Ferdig')),
  image_before_url text,
  image_after_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  last_reviewed_date date
);

-- Enable RLS
ALTER TABLE hms_risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (restaurant operations)
CREATE POLICY "Allow public read access to risk assessments"
  ON hms_risk_assessments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to risk assessments"
  ON hms_risk_assessments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to risk assessments"
  ON hms_risk_assessments
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to risk assessments"
  ON hms_risk_assessments
  FOR DELETE
  TO public
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status 
  ON hms_risk_assessments(status);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level 
  ON hms_risk_assessments(risk_level);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_deadline 
  ON hms_risk_assessments(deadline);

-- Insert example risk assessments for restaurant
INSERT INTO hms_risk_assessments (
  hazard_type,
  hazard_description,
  likelihood,
  consequence,
  preventive_measures,
  responsible_person,
  deadline,
  status,
  created_by,
  notes
) VALUES
  (
    'Glatt gulv',
    'Risiko for fall ved vask og olje på gulvet i kjøkkenet',
    4,
    3,
    E'1. Bruke sklisikre matter\n2. Hyppigere vask og tørk\n3. Informasjon til ansatte om forsiktighet',
    'Kjøkkensjef',
    CURRENT_DATE + INTERVAL '7 days',
    'Under arbeid',
    'System',
    'Spesielt farlig under travle perioder'
  ),
  (
    'Varm olje',
    'Fare for brann eller alvorlig brannskade ved bruk av frityr',
    3,
    4,
    E'1. Brannslukker tilgjengelig og synlig\n2. Oppdatert rutiner ved bruk av frityr\n3. Opplæring av alle ansatte',
    'Daglig leder',
    CURRENT_DATE + INTERVAL '14 days',
    'Åpen',
    'System',
    'Brannslukker må kontrolleres regelmessig'
  ),
  (
    'Elektrisk panel',
    'Risiko for elektrisk støt eller brann ved feil på elektrisk anlegg',
    2,
    5,
    E'1. Årlig kontroll av autorisert elektriker\n2. Ingen uautoriserte personer skal åpne panelet\n3. Tydelig merking og advarselsskilt',
    'Daglig leder',
    CURRENT_DATE - INTERVAL '30 days',
    'Ferdig',
    'System',
    'Kontroll utført av godkjent elektriker'
  ),
  (
    'Kniver og skarpe gjenstander',
    'Risiko for kutt ved bruk av kniver og slicemaskiner',
    4,
    2,
    E'1. Riktig oppbevaring av kniver\n2. Opplæring i korrekt bruk\n3. Beskyttelseshansker tilgjengelig',
    'Kjøkkensjef',
    CURRENT_DATE + INTERVAL '3 days',
    'Under arbeid',
    'System',
    'Slicemaskin må ha sikkerhet montert'
  ),
  (
    'Tung løfting',
    'Risiko for ryggskader ved mottak og håndtering av tunge varer',
    3,
    3,
    E'1. To personer ved tunge løft\n2. Bruk av tralle/vogn\n3. Ergonomisk opplæring',
    'Kjøkkensjef',
    CURRENT_DATE + INTERVAL '10 days',
    'Åpen',
    'System',
    'Særlig viktig ved varemottak'
  );
