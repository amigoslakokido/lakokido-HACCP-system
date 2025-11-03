/*
  # Split Oppvaskmaskin into Vask and Tørk zones

  1. Changes
    - Update existing "Oppvaskmaskin" zone to "Oppvaskmaskin - Vask"
    - Add new "Oppvaskmaskin - Tørk" zone
    - Vask: 60°C to 65°C (washing temperature)
    - Tørk: 80°C to 85°C (drying temperature)

  2. Notes
    - Each zone will have its own temperature range
    - Existing equipment will remain in Vask zone
*/

-- Update existing Oppvaskmaskin to Vask
UPDATE zones 
SET 
  name = 'Oppvaskmaskin - Vask',
  description = 'Vasketemperatur for oppvaskmaskin - Trygt område: 60°C til 65°C'
WHERE name = 'Oppvaskmaskin';

-- Add new Tørk zone
INSERT INTO zones (name, description) VALUES
  ('Oppvaskmaskin - Tørk', 'Tørketemperatur for oppvaskmaskin - Trygt område: 80°C til 85°C')
ON CONFLICT DO NOTHING;