/*
  # Revert Oppvaskmaskin split and add predefined equipment items

  1. Changes
    - Rename "Oppvaskmaskin - Vask" back to "Oppvaskmaskin"
    - Delete "Oppvaskmaskin - Tørk" zone
    - Add two predefined equipment items to Oppvaskmaskin zone:
      - Vask (60°C to 65°C)
      - Tørk (80°C to 85°C)

  2. Notes
    - Equipment items will appear as options within Oppvaskmaskin zone
    - Each item has its own temperature range
*/

-- Rename Vask back to Oppvaskmaskin
UPDATE zones 
SET 
  name = 'Oppvaskmaskin',
  description = 'Oppvaskmaskintemperaturer - Trygt område: 60°C til 85°C'
WHERE name = 'Oppvaskmaskin - Vask';

-- Get the Oppvaskmaskin zone ID and add equipment items
DO $$
DECLARE
  oppvaskmaskin_zone_id uuid;
BEGIN
  -- Get Oppvaskmaskin zone ID
  SELECT id INTO oppvaskmaskin_zone_id FROM zones WHERE name = 'Oppvaskmaskin' LIMIT 1;

  IF oppvaskmaskin_zone_id IS NOT NULL THEN
    -- Add Vask equipment
    INSERT INTO equipment (name, type, zone_id, min_temp, max_temp, active)
    VALUES ('Vask', 'other', oppvaskmaskin_zone_id, 60, 65, true)
    ON CONFLICT DO NOTHING;

    -- Add Tørk equipment
    INSERT INTO equipment (name, type, zone_id, min_temp, max_temp, active)
    VALUES ('Tørk', 'other', oppvaskmaskin_zone_id, 80, 85, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Delete the separate Tørk zone if it exists
DELETE FROM zones WHERE name = 'Oppvaskmaskin - Tørk';