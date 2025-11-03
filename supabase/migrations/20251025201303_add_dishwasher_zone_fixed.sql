/*
  # Add Dishwasher Zone to Temperature System

  1. Changes
    - Add new temperature zone "Oppvaskmaskin" (Dishwasher)
    - Add 2 temperature items:
      - Vasktemperatur (Wash): 55-70°C
      - Tørktemperatur (Dry): 75-90°C
    - Remove old dishwasher_logs table (moved to temperature system)
  
  2. Notes
    - Dishwasher now part of regular temperature monitoring
    - Single daily recording like other temperature items
*/

-- Drop old dishwasher_logs table
DROP TABLE IF EXISTS dishwasher_logs CASCADE;

-- Add dishwasher zone
INSERT INTO temperature_zones (name_no, zone_type, min_temp, max_temp, is_active, sort_order)
VALUES 
  ('Oppvaskmaskin', 'dishwasher', 55.0, 90.0, true, 10)
ON CONFLICT DO NOTHING;

-- Add dishwasher temperature items
DO $$
DECLARE
  dishwasher_zone_id uuid;
BEGIN
  SELECT id INTO dishwasher_zone_id 
  FROM temperature_zones 
  WHERE zone_type = 'dishwasher' 
  LIMIT 1;

  IF dishwasher_zone_id IS NOT NULL THEN
    INSERT INTO temperature_items (zone_id, name_no, is_active, sort_order)
    VALUES 
      (dishwasher_zone_id, 'Vasktemperatur (55-70°C)', true, 1),
      (dishwasher_zone_id, 'Tørktemperatur (75-90°C)', true, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Add sample temperature logs
DO $$
DECLARE
  wash_item_id uuid;
  dry_item_id uuid;
BEGIN
  SELECT ti.id INTO wash_item_id 
  FROM temperature_items ti
  JOIN temperature_zones tz ON ti.zone_id = tz.id
  WHERE tz.zone_type = 'dishwasher' 
    AND ti.name_no LIKE 'Vasktemperatur%'
  LIMIT 1;
  
  SELECT ti.id INTO dry_item_id 
  FROM temperature_items ti
  JOIN temperature_zones tz ON ti.zone_id = tz.id
  WHERE tz.zone_type = 'dishwasher' 
    AND ti.name_no LIKE 'Tørktemperatur%'
  LIMIT 1;

  IF wash_item_id IS NOT NULL THEN
    INSERT INTO temperature_logs (item_id, recorded_temp, recorded_date, recorded_time, status, recorded_by)
    VALUES 
      (wash_item_id, 62.0, '2025-10-25', '09:00:00', 'safe', 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5'),
      (wash_item_id, 58.5, '2025-10-24', '10:00:00', 'safe', 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5')
    ON CONFLICT DO NOTHING;
  END IF;

  IF dry_item_id IS NOT NULL THEN
    INSERT INTO temperature_logs (item_id, recorded_temp, recorded_date, recorded_time, status, recorded_by)
    VALUES 
      (dry_item_id, 82.0, '2025-10-25', '09:00:00', 'safe', 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5'),
      (dry_item_id, 85.0, '2025-10-24', '10:00:00', 'safe', 'bc7a8fb9-c6c3-4ce0-9cd6-b4c07cf64ac5')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
