/*
  # Create HMS Management Training System

  1. New Tables
    - `hms_management_training_info`
      - `id` (uuid, primary key)
      - `manager_name` (text) - Daglig leder navn
      - `manager_phone` (text) - Telefon
      - `manager_email` (text) - E-post
      - `manager_position` (text) - Stilling (default: 'Daglig leder')
      - `course_name` (text) - Kursnavn
      - `course_provider` (text) - Kursleverandør
      - `completion_date` (date) - Dato fullført
      - `status` (text) - 'completed', 'not_completed'
      - `renewal_recommendation` (text) - Fornyelsesanbefaling
      - `current_certificate_url` (text) - Nåværende kursbevis URL
      - `purpose_text` (text) - Fast tekst om formål
      - `notes` (text) - Notater og dokumentasjon
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hms_training_history`
      - `id` (uuid, primary key)
      - `certificate_url` (text) - Kursbevis URL
      - `course_name` (text) - Kursnavn
      - `completion_date` (date) - Fullføringsdato
      - `uploaded_by` (text) - Hvem lastet opp
      - `uploaded_at` (timestamptz) - Når det ble lastet opp
      - `notes` (text) - Notater
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Create management training info table (single row configuration)
CREATE TABLE IF NOT EXISTS hms_management_training_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_name text DEFAULT '',
  manager_phone text DEFAULT '',
  manager_email text DEFAULT '',
  manager_position text DEFAULT 'Daglig leder',
  course_name text DEFAULT 'HMS opplæring for ledere',
  course_provider text DEFAULT '',
  completion_date date,
  status text DEFAULT 'not_completed' CHECK (status IN ('completed', 'not_completed')),
  renewal_recommendation text DEFAULT 'Anbefalt fornyelse hvert 3–5 år',
  current_certificate_url text DEFAULT '',
  purpose_text text DEFAULT 'HMS-opplæring for ledelse sikrer at daglig leder har nødvendig kompetanse til å ivareta arbeidsmiljøet, forebygge skader og ulykker, og oppfylle lovpålagte krav til helse, miljø og sikkerhet i virksomheten. Opplæringen gir innsikt i HMS-systemet, risikovurdering, og lederens ansvar for et godt og sikkert arbeidsmiljø.',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create training history table
CREATE TABLE IF NOT EXISTS hms_training_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_url text NOT NULL,
  course_name text NOT NULL,
  completion_date date NOT NULL,
  uploaded_by text DEFAULT '',
  uploaded_at timestamptz DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hms_management_training_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_training_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hms_management_training_info
CREATE POLICY "Users can view management training info"
  ON hms_management_training_info FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert management training info"
  ON hms_management_training_info FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update management training info"
  ON hms_management_training_info FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete management training info"
  ON hms_management_training_info FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for hms_training_history
CREATE POLICY "Users can view training history"
  ON hms_training_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert training history"
  ON hms_training_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update training history"
  ON hms_training_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete training history"
  ON hms_training_history FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_history_date ON hms_training_history(completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_training_history_uploaded ON hms_training_history(uploaded_at DESC);
