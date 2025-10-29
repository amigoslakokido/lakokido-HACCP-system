/*
  # Add Description Column to Cleaning Tasks

  1. Changes
    - Add description column to cleaning_tasks table
    - Update existing tasks with Norwegian descriptions
  
  2. Notes
    - Descriptions will appear in the cleaning table
*/

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cleaning_tasks' AND column_name = 'description'
  ) THEN
    ALTER TABLE cleaning_tasks ADD COLUMN description text DEFAULT '';
  END IF;
END $$;

-- Update existing tasks with descriptions
UPDATE cleaning_tasks
SET description = CASE name_no
  WHEN 'Gulvvask kjøkken' THEN 'Grundig vask av alle gulvflater i kjøkkenområdet'
  WHEN 'Ovnsrengjøring' THEN 'Rengjøre ovner innvendig og utvendig'
  WHEN 'Kjøleskapsrengjøring' THEN 'Rengjøre kjøleskap innvendig, fjerne gamle varer'
  WHEN 'Fryserboks rengjøring' THEN 'Tine og rengjøre fryserbokser grundig'
  WHEN 'Ventilasjon filter' THEN 'Skifte/rengjøre ventilasjonsfilter'
  WHEN 'Søppelhåndtering område' THEN 'Rengjøre søppelområde og desinfisere'
  WHEN 'Benkeplater desinfeksjon' THEN 'Desinfisere alle arbeidsflater'
  WHEN 'Håndvask stasjon' THEN 'Påfylle såpe, sjekke at alt fungerer'
  ELSE 'Utfør oppgaven grundig'
END
WHERE description IS NULL OR description = '';
