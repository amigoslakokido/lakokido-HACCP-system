/*
  # Create Complete Training System

  1. New Tables
    - `training_fire_safety`
      - Fire safety training records for employees
      - Includes participant list and documentation
    
    - `training_first_aid`
      - First aid training records
      - Certificate validity tracking
    
    - `training_routine`
      - Routine training checklists
      - Dual signature system (employee + manager)
    
    - `training_routine_items`
      - Dynamic checklist items for routine training
    
    - `training_safety_equipment`
      - Equipment-specific safety training
      - Machine training status tracking
    
    - `training_log`
      - Complete training history per employee
      - Cross-references all training types
    
    - `training_new_employee_confirmation`
      - New employee training confirmation forms
      - Dual signature with PDF export capability

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
*/

-- Fire Safety Training Table
CREATE TABLE IF NOT EXISTS training_fire_safety (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  employee_id text,
  course_name text DEFAULT 'Brannvernkurs',
  course_date date NOT NULL,
  responsible_person text NOT NULL,
  instructor text DEFAULT '',
  location text DEFAULT '',
  certificate_url text DEFAULT '',
  participant_list_url text DEFAULT '',
  notes text DEFAULT '',
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'expired')),
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- First Aid Training Table
CREATE TABLE IF NOT EXISTS training_first_aid (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  employee_id text,
  course_name text DEFAULT 'Førstehjelp',
  course_provider text DEFAULT '',
  course_date date NOT NULL,
  certificate_url text DEFAULT '',
  valid_from date,
  valid_until date,
  status text DEFAULT 'valid' CHECK (status IN ('valid', 'expiring_soon', 'expired')),
  renewal_reminder_sent boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Routine Training Checklist Items (Template)
CREATE TABLE IF NOT EXISTS training_routine_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('washing', 'hygiene', 'equipment', 'safety')),
  item_text text NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Routine Training Records
CREATE TABLE IF NOT EXISTS training_routine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  employee_id text,
  training_date date NOT NULL,
  category text NOT NULL CHECK (category IN ('washing', 'hygiene', 'equipment', 'safety', 'all')),
  completed_items jsonb DEFAULT '[]'::jsonb,
  employee_signature text DEFAULT '',
  employee_signed_at timestamptz,
  manager_signature text DEFAULT '',
  manager_signed_at timestamptz,
  manager_name text DEFAULT '',
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'pending_manager_signature')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Safety Equipment Training
CREATE TABLE IF NOT EXISTS training_safety_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  employee_id text,
  equipment_name text NOT NULL,
  equipment_type text DEFAULT '' CHECK (equipment_type IN ('', 'fryer', 'oven', 'slicer', 'dishwasher', 'mixer', 'other')),
  training_date date NOT NULL,
  trainer_name text DEFAULT '',
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'needs_refresh')),
  completion_date date,
  documentation_url text DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training Log (Aggregated View)
CREATE TABLE IF NOT EXISTS training_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  employee_id text,
  training_type text NOT NULL CHECK (training_type IN ('management', 'fire_safety', 'first_aid', 'routine', 'safety_equipment', 'new_employee', 'other')),
  training_name text NOT NULL,
  training_date date NOT NULL,
  completion_date date,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'expired', 'pending')),
  documentation_url text DEFAULT '',
  reference_id uuid,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- New Employee Training Confirmation
CREATE TABLE IF NOT EXISTS training_new_employee_confirmation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  employee_id text,
  start_date date NOT NULL,
  training_completed_date date,
  topics_covered jsonb DEFAULT '[]'::jsonb,
  employee_signature text DEFAULT '',
  employee_signed_at timestamptz,
  manager_signature text DEFAULT '',
  manager_signed_at timestamptz,
  manager_name text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'employee_signed', 'completed')),
  pdf_url text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE training_fire_safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_first_aid ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_routine_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_routine ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_safety_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_new_employee_confirmation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_fire_safety
CREATE POLICY "Users can view fire safety training"
  ON training_fire_safety FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert fire safety training"
  ON training_fire_safety FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update fire safety training"
  ON training_fire_safety FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete fire safety training"
  ON training_fire_safety FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for training_first_aid
CREATE POLICY "Users can view first aid training"
  ON training_first_aid FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert first aid training"
  ON training_first_aid FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update first aid training"
  ON training_first_aid FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete first aid training"
  ON training_first_aid FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for training_routine_items
CREATE POLICY "Users can view routine items"
  ON training_routine_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert routine items"
  ON training_routine_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update routine items"
  ON training_routine_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete routine items"
  ON training_routine_items FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for training_routine
CREATE POLICY "Users can view routine training"
  ON training_routine FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert routine training"
  ON training_routine FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update routine training"
  ON training_routine FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete routine training"
  ON training_routine FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for training_safety_equipment
CREATE POLICY "Users can view safety equipment training"
  ON training_safety_equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert safety equipment training"
  ON training_safety_equipment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update safety equipment training"
  ON training_safety_equipment FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete safety equipment training"
  ON training_safety_equipment FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for training_log
CREATE POLICY "Users can view training log"
  ON training_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert training log"
  ON training_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update training log"
  ON training_log FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete training log"
  ON training_log FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for training_new_employee_confirmation
CREATE POLICY "Users can view new employee confirmations"
  ON training_new_employee_confirmation FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert new employee confirmations"
  ON training_new_employee_confirmation FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update new employee confirmations"
  ON training_new_employee_confirmation FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete new employee confirmations"
  ON training_new_employee_confirmation FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fire_safety_employee ON training_fire_safety(employee_name, course_date DESC);
CREATE INDEX IF NOT EXISTS idx_fire_safety_status ON training_fire_safety(status);
CREATE INDEX IF NOT EXISTS idx_first_aid_employee ON training_first_aid(employee_name, course_date DESC);
CREATE INDEX IF NOT EXISTS idx_first_aid_validity ON training_first_aid(valid_until);
CREATE INDEX IF NOT EXISTS idx_routine_employee ON training_routine(employee_name, training_date DESC);
CREATE INDEX IF NOT EXISTS idx_safety_equipment_employee ON training_safety_equipment(employee_name, training_date DESC);
CREATE INDEX IF NOT EXISTS idx_training_log_employee ON training_log(employee_name, training_date DESC);
CREATE INDEX IF NOT EXISTS idx_new_employee_status ON training_new_employee_confirmation(status);

-- Insert default routine training items
INSERT INTO training_routine_items (category, item_text, description, display_order) VALUES
  ('washing', 'Håndvask teknikk', 'Riktig teknikk for håndvask før arbeid', 1),
  ('washing', 'Når skal man vaske hender', 'Tidspunkter for obligatorisk håndvask', 2),
  ('washing', 'Bruk av hansker', 'Riktig bruk og skifte av hansker', 3),
  ('hygiene', 'Personlig hygiene', 'Krav til personlig hygiene på jobb', 1),
  ('hygiene', 'Arbeidstøy', 'Riktig bruk av arbeidstøy og hårfeste', 2),
  ('hygiene', 'Matvarehygiene', 'Lagring og håndtering av matvarer', 3),
  ('hygiene', 'Kryssforurensing', 'Forebygging av kryssforurensing', 4),
  ('equipment', 'Rengjøring av utstyr', 'Riktig rengjøring av kjøkkenutstyr', 1),
  ('equipment', 'Bruk av rengjøringsmidler', 'Sikker bruk av kjemikalier', 2),
  ('equipment', 'Oppvaskmaskin', 'Riktig bruk og vedlikehold', 3),
  ('safety', 'Knivhåndtering', 'Sikker bruk av kniver', 1),
  ('safety', 'Varme overflater', 'Håndtering av stekeovner og kokeplater', 2),
  ('safety', 'Løfteteknikk', 'Riktig løfteteknikk for tunge gjenstander', 3),
  ('safety', 'Nødstopp og brannslukker', 'Plassering og bruk av sikkerhetsutstyr', 4)
ON CONFLICT DO NOTHING;
