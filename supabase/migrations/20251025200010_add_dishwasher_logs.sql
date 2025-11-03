/*
  # Add Dishwasher Temperature Logging

  1. New Table: dishwasher_logs
    - Tracks dishwasher wash and dry temperatures
    - Two temperature readings per log entry
    - Wash temp range: 55-70°C
    - Dry temp range: 75-90°C
  
  2. Changes to hygiene_checks
    - System now supports selecting 1-2 employees per day
    - Data will be included in daily reports
  
  3. Security
    - Enable RLS with public access policies
*/

-- Create dishwasher_logs table
CREATE TABLE IF NOT EXISTS dishwasher_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  log_time time NOT NULL DEFAULT CURRENT_TIME,
  wash_temp decimal(4,1) NOT NULL,
  dry_temp decimal(4,1) NOT NULL,
  status text NOT NULL DEFAULT 'OK',
  notes text DEFAULT '',
  recorded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_dishwasher_logs_date ON dishwasher_logs(log_date DESC);

-- Enable RLS
ALTER TABLE dishwasher_logs ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Public can view dishwasher logs"
  ON dishwasher_logs FOR SELECT
  USING (true);

CREATE POLICY "Public can create dishwasher logs"
  ON dishwasher_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update dishwasher logs"
  ON dishwasher_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete dishwasher logs"
  ON dishwasher_logs FOR DELETE
  USING (true);

-- Insert sample data for today
INSERT INTO dishwasher_logs (log_date, log_time, wash_temp, dry_temp, status, notes, recorded_by)
VALUES 
  ('2025-10-25', '08:30:00', 62.0, 82.0, 'OK', 'Morgensjekk - alt i orden', 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5'),
  ('2025-10-25', '14:15:00', 58.0, 85.0, 'OK', 'Ettermiddagskontroll', 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5'),
  ('2025-10-24', '09:00:00', 65.0, 88.0, 'OK', 'Første sjekk', 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5')
ON CONFLICT DO NOTHING;
