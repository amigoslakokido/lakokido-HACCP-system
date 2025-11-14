/*
  # Create Incidents, Deviations and Follow-up System

  1. New Tables
    - `hms_incident_registry`
      - Complete incident registration with type, location, people involved
      - Image and document attachments
      - Can be linked to deviations
    
    - `hms_deviations`
      - Deviation types (Safety, Work Environment, Fire, Equipment, Routines)
      - Risk level, responsible person, deadline
      - Status tracking (Open, In Progress, Closed)
    
    - `hms_followup`
      - Root cause analysis
      - Corrective actions
      - Preventive actions
      - Automatic linking to incidents and deviations
      - Confirmation by manager/HMS responsible

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage records

  3. Indexes
    - Performance indexes on frequently queried columns
*/

-- Incidents Registry Table
CREATE TABLE IF NOT EXISTS hms_incident_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_date date NOT NULL,
  incident_time time NOT NULL,
  location text NOT NULL,
  incident_type text NOT NULL CHECK (incident_type IN ('accident', 'personal_injury', 'near_miss', 'material_damage', 'other')),
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  involved_person text DEFAULT '',
  involved_person_id text DEFAULT '',
  witness_names text DEFAULT '',
  notification_sent boolean DEFAULT false,
  notification_to text DEFAULT '',
  notification_date timestamptz,
  images jsonb DEFAULT '[]'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  linked_deviation_id uuid,
  immediate_actions text DEFAULT '',
  reported_by text NOT NULL,
  reported_at timestamptz DEFAULT now(),
  status text DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'completed', 'closed')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deviations Table
CREATE TABLE IF NOT EXISTS hms_deviations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deviation_type text NOT NULL CHECK (deviation_type IN ('safety', 'work_environment', 'fire', 'equipment', 'routines', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  identified_date date NOT NULL,
  identified_by text NOT NULL,
  location text DEFAULT '',
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  responsible_person text DEFAULT '',
  deadline date,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  attachments jsonb DEFAULT '[]'::jsonb,
  linked_incident_id uuid,
  resolution_description text DEFAULT '',
  resolved_date date,
  resolved_by text DEFAULT '',
  verification_required boolean DEFAULT true,
  verified_by text DEFAULT '',
  verified_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Follow-up Table
CREATE TABLE IF NOT EXISTS hms_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  linked_incident_id uuid,
  linked_deviation_id uuid,
  followup_type text NOT NULL CHECK (followup_type IN ('incident', 'deviation', 'both')),
  root_cause_analysis text NOT NULL,
  contributing_factors text DEFAULT '',
  corrective_actions jsonb DEFAULT '[]'::jsonb,
  preventive_actions jsonb DEFAULT '[]'::jsonb,
  responsible_person text NOT NULL,
  deadline date,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'verified')),
  completion_date date,
  completed_by text DEFAULT '',
  confirmed_by text DEFAULT '',
  confirmed_date date,
  confirmation_role text DEFAULT '' CHECK (confirmation_role IN ('', 'manager', 'hms_responsible', 'safety_representative')),
  effectiveness_evaluation text DEFAULT '',
  evaluation_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hms_incident_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_followup ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hms_incident_registry
CREATE POLICY "Users can view incident registry"
  ON hms_incident_registry FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert incident registry"
  ON hms_incident_registry FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update incident registry"
  ON hms_incident_registry FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete incident registry"
  ON hms_incident_registry FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for hms_deviations
CREATE POLICY "Users can view deviations"
  ON hms_deviations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert deviations"
  ON hms_deviations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update deviations"
  ON hms_deviations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete deviations"
  ON hms_deviations FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for hms_followup
CREATE POLICY "Users can view followup"
  ON hms_followup FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert followup"
  ON hms_followup FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update followup"
  ON hms_followup FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete followup"
  ON hms_followup FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_incident_registry_date ON hms_incident_registry(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_incident_registry_type ON hms_incident_registry(incident_type);
CREATE INDEX IF NOT EXISTS idx_incident_registry_status ON hms_incident_registry(status);
CREATE INDEX IF NOT EXISTS idx_incident_registry_severity ON hms_incident_registry(severity);

CREATE INDEX IF NOT EXISTS idx_deviations_type ON hms_deviations(deviation_type);
CREATE INDEX IF NOT EXISTS idx_deviations_status ON hms_deviations(status);
CREATE INDEX IF NOT EXISTS idx_deviations_risk ON hms_deviations(risk_level);
CREATE INDEX IF NOT EXISTS idx_deviations_deadline ON hms_deviations(deadline);

CREATE INDEX IF NOT EXISTS idx_followup_incident ON hms_followup(linked_incident_id);
CREATE INDEX IF NOT EXISTS idx_followup_deviation ON hms_followup(linked_deviation_id);
CREATE INDEX IF NOT EXISTS idx_followup_status ON hms_followup(status);

-- Foreign key relationships (optional, for data integrity)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_incident_deviation'
  ) THEN
    ALTER TABLE hms_incident_registry 
    ADD CONSTRAINT fk_incident_deviation 
    FOREIGN KEY (linked_deviation_id) 
    REFERENCES hms_deviations(id) 
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_deviation_incident'
  ) THEN
    ALTER TABLE hms_deviations 
    ADD CONSTRAINT fk_deviation_incident 
    FOREIGN KEY (linked_incident_id) 
    REFERENCES hms_incident_registry(id) 
    ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_followup_incident'
  ) THEN
    ALTER TABLE hms_followup 
    ADD CONSTRAINT fk_followup_incident 
    FOREIGN KEY (linked_incident_id) 
    REFERENCES hms_incident_registry(id) 
    ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_followup_deviation'
  ) THEN
    ALTER TABLE hms_followup 
    ADD CONSTRAINT fk_followup_deviation 
    FOREIGN KEY (linked_deviation_id) 
    REFERENCES hms_deviations(id) 
    ON DELETE CASCADE;
  END IF;
END $$;
