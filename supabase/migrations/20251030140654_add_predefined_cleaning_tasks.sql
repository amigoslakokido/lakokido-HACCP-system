/*
  # Add Predefined Cleaning Tasks for LA kokido

  1. Changes
    - Insert standard HACCP cleaning tasks
    - Tasks are linked to appropriate zones
    - Includes daily, weekly, and monthly tasks

  2. Task Categories
    - Kitchen cleaning tasks
    - Storage area cleaning
    - Refrigerator/Freezer cleaning
    - Dishwasher cleaning
    - General hygiene tasks
*/

-- Get zone IDs
DO $$
DECLARE
  kjoleskap_zone_id uuid;
  fryser_zone_id uuid;
  oppvaskmaskin_zone_id uuid;
  varemottak_zone_id uuid;
BEGIN
  -- Get zone IDs
  SELECT id INTO kjoleskap_zone_id FROM zones WHERE name = 'Kjøleskap' LIMIT 1;
  SELECT id INTO fryser_zone_id FROM zones WHERE name = 'Fryser' LIMIT 1;
  SELECT id INTO oppvaskmaskin_zone_id FROM zones WHERE name = 'Oppvaskmaskin' LIMIT 1;
  SELECT id INTO varemottak_zone_id FROM zones WHERE name = 'Varemottak' LIMIT 1;

  -- Insert daily cleaning tasks
  INSERT INTO cleaning_tasks (task_name, description, frequency, zone_id, active) VALUES
    ('Rengjøring av arbeidsbord', 'Tørk av alle arbeidsbord med desinfeksjonsmiddel', 'daily', NULL, true),
    ('Gulvvask i kjøkken', 'Vask og desinfiser kjøkkengulv', 'daily', NULL, true),
    ('Rengjøring av oppvaskmaskin', 'Rengjør filter og inspiser oppvaskmaskin', 'daily', oppvaskmaskin_zone_id, true),
    ('Tømming av søppel', 'Tøm alle søppelbøtter og bytt poser', 'daily', NULL, true),
    ('Rengjøring av håndvasker', 'Vask og desinfiser alle håndvasker', 'daily', NULL, true)
  ON CONFLICT DO NOTHING;

  -- Insert weekly cleaning tasks  
  INSERT INTO cleaning_tasks (task_name, description, frequency, zone_id, active) VALUES
    ('Dyptørking av kjøleskap', 'Tøm og rengjør alle kjøleskap grundig', 'weekly', kjoleskap_zone_id, true),
    ('Dyptørking av fryser', 'Tøm og rengjør alle frysere grundig', 'weekly', fryser_zone_id, true),
    ('Rengjøring av ventilasjonsfilter', 'Rengjør eller bytt ventilasjonsfilter', 'weekly', NULL, true),
    ('Rengjøring av varemottak', 'Grundig rengjøring av varemottaksområde', 'weekly', varemottak_zone_id, true),
    ('Rengjøring av hyller og skap', 'Tørk av alle hyller og skap innvendig og utvendig', 'weekly', NULL, true)
  ON CONFLICT DO NOTHING;

  -- Insert monthly cleaning tasks
  INSERT INTO cleaning_tasks (task_name, description, frequency, zone_id, active) VALUES
    ('Dyprengjøring av kjøkken', 'Grundig rengjøring av hele kjøkkenet inkludert tak og vegger', 'monthly', NULL, true),
    ('Inspeksjon og rengjøring av avløp', 'Inspiser og rengjør alle avløp', 'monthly', NULL, true),
    ('Rengjøring bak og under utstyr', 'Flytt utstyr og rengjør bak og under', 'monthly', NULL, true),
    ('Kontroll av rengjøringsutstyr', 'Inspiser og rengjør alt rengjøringsutstyr', 'monthly', NULL, true)
  ON CONFLICT DO NOTHING;

END $$;