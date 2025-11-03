/*
  # Initial HACCP System Data

  ## Purpose
  Populate the database with initial configuration data:
  - Default temperature zones (refrigerators, freezers, dishwashers, etc.)
  - Sample temperature monitoring items
  - Standard cleaning tasks (daily, weekly, monthly)
  - System settings for company information

  ## Data Inserted
  1. Temperature zones with Norwegian names and safe temperature ranges
  2. Example items for each zone
  3. 15 cleaning tasks as per requirements
  4. Company information settings
*/

-- Insert default temperature zones
INSERT INTO temperature_zones (name_no, zone_type, min_temp, max_temp, sort_order) VALUES
  ('Kjøleskap', 'refrigerator', 0, 4, 1),
  ('Fryser', 'freezer', -22, -18, 2),
  ('Oppvaskmaskin', 'dishwasher', 60, 85, 3),
  ('Kjøtt før servering', 'meat_serving', 70, 100, 4),
  ('Varemottak', 'receiving', -5, 4, 5)
ON CONFLICT DO NOTHING;

-- Insert sample temperature items for refrigerators
INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Kjøleskap 1', 1 FROM temperature_zones WHERE zone_type = 'refrigerator';

INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Kjøleskap 2', 2 FROM temperature_zones WHERE zone_type = 'refrigerator';

INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Kjøleskap 3', 3 FROM temperature_zones WHERE zone_type = 'refrigerator';

-- Insert sample temperature items for freezers
INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Fryser 1', 1 FROM temperature_zones WHERE zone_type = 'freezer';

INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Fryser 2', 2 FROM temperature_zones WHERE zone_type = 'freezer';

-- Insert sample temperature items for dishwasher
INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Oppvaskmaskin hovedkjøkken', 1 FROM temperature_zones WHERE zone_type = 'dishwasher';

-- Insert sample temperature items for meat serving
INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Kjøtttermometer 1', 1 FROM temperature_zones WHERE zone_type = 'meat_serving';

INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Kjøtttermometer 2', 2 FROM temperature_zones WHERE zone_type = 'meat_serving';

-- Insert sample temperature items for receiving
INSERT INTO temperature_items (zone_id, name_no, sort_order)
SELECT id, 'Varemottak termometer', 1 FROM temperature_zones WHERE zone_type = 'receiving';

-- Insert 15 default cleaning tasks
INSERT INTO cleaning_tasks (name_no, frequency, sort_order) VALUES
  ('Rengjøring av alle arbeidsflater', 'daily', 1),
  ('Desinfeksjon av skjærebrett', 'daily', 2),
  ('Rengjøring av kjøkkenbenker', 'daily', 3),
  ('Tømming av søppel', 'daily', 4),
  ('Mopping av gulv', 'daily', 5),
  ('Rengjøring av ovner og komfyrer', 'weekly', 6),
  ('Dyprengjøring av kjøleskap', 'weekly', 7),
  ('Rengjøring av ventilasjonsfilter', 'weekly', 8),
  ('Desinfeksjon av håndtak og brytere', 'weekly', 9),
  ('Rengjøring av kjøkkenutstyr', 'weekly', 10),
  ('Fullstendig gulvvask', 'monthly', 11),
  ('Rengjøring av lagerplass', 'monthly', 12),
  ('Inspeksjon av dreneringssystem', 'monthly', 13),
  ('Dyprengjøring av fryser', 'monthly', 14),
  ('Sanitær kontroll av hele kjøkkenet', 'monthly', 15)
ON CONFLICT DO NOTHING;

-- Insert company settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
  ('company_info', '{
    "name": "GE Amigos AS",
    "address": "Hollendergata 2",
    "postal_code": "1607",
    "city": "Fredrikstad",
    "report_title": "Interkontroll rapport - HACCP"
  }'::jsonb),
  ('temperature_defaults', '{
    "refrigerator": {"min": 0, "max": 4},
    "freezer": {"min": -22, "max": -18},
    "dishwasher": {"min": 60, "max": 85},
    "meat_serving": {"min": 70, "max": 100},
    "receiving": {"min": -5, "max": 4}
  }'::jsonb)
ON CONFLICT (setting_key) DO UPDATE 
  SET setting_value = EXCLUDED.setting_value;
