/*
  # Add Cooling Validation Logic for Mattilsynet Standards
  
  This migration implements the Norwegian food safety standards for cooling hot food:
  
  1. Cooling Requirements (Mattilsynet Standard)
    - Stage 1: From +60°C to +20°C within 2 hours maximum
    - Stage 2: From +20°C to +10°C within additional 4 hours
    - Total: 6 hours from cooking (+60-80°C) to refrigeration (≤+10°C)
  
  2. Status Calculation
    - ✅ safe (Godkjent): Reached ≤+10°C within 6 hours
    - ⚠️ warning: Minor deviation but acceptable
    - ❌ danger (Ikke godkjent): Did not reach ≤+10°C within 6 hours or exceeded 2h for Stage 1
  
  3. Changes
    - Add function to calculate cooling status automatically
    - Add trigger to validate cooling logs on insert/update
    - Add detailed validation notes
  
  4. Validation Rules
    - temp_initial should be between +60°C and +90°C (freshly cooked)
    - temp_2h should be ≤ +20°C (Stage 1 compliance)
    - temp_6h should be ≤ +10°C (Stage 2 compliance)
    - If temp_2h > +20°C → warning or danger
    - If temp_6h > +10°C → danger (must discard food)
*/

-- Create function to calculate cooling status based on Mattilsynet rules
CREATE OR REPLACE FUNCTION calculate_cooling_status(
  initial_temp decimal,
  temp_at_2h decimal,
  temp_at_6h decimal
) RETURNS text AS $$
DECLARE
  calculated_status text;
BEGIN
  -- Check if all temperatures are recorded
  IF initial_temp IS NULL OR temp_at_2h IS NULL OR temp_at_6h IS NULL THEN
    RETURN 'safe'; -- Default for incomplete data
  END IF;
  
  -- Rule 1: Initial temp should be hot (60-90°C)
  IF initial_temp < 60 THEN
    RETURN 'warning'; -- Food wasn't hot enough initially
  END IF;
  
  -- Rule 2: After 2 hours, must be ≤ +20°C (Stage 1)
  IF temp_at_2h > 20 THEN
    -- Critical failure: Stage 1 not met
    RETURN 'danger';
  END IF;
  
  -- Rule 3: After 6 hours, must be ≤ +10°C (Stage 2)
  IF temp_at_6h > 10 THEN
    -- Critical failure: Not safe for refrigeration
    RETURN 'danger';
  END IF;
  
  -- Rule 4: Check if cooling was optimal
  IF temp_at_6h <= 4 AND temp_at_2h <= 15 THEN
    -- Excellent cooling
    RETURN 'safe';
  ELSIF temp_at_6h <= 10 AND temp_at_2h <= 20 THEN
    -- Acceptable cooling (meets minimum requirements)
    RETURN 'safe';
  ELSE
    -- Some concern but acceptable
    RETURN 'warning';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to generate validation notes
CREATE OR REPLACE FUNCTION generate_cooling_notes(
  initial_temp decimal,
  temp_at_2h decimal,
  temp_at_6h decimal,
  current_status text
) RETURNS text AS $$
DECLARE
  note_text text := '';
BEGIN
  IF initial_temp IS NULL OR temp_at_2h IS NULL OR temp_at_6h IS NULL THEN
    RETURN 'Ufullstendig registrering';
  END IF;
  
  -- Check Stage 1 (2 hours)
  IF temp_at_2h > 20 THEN
    note_text := note_text || 'Ikke godkjent – Stage 1 mislykket: Temp etter 2t (' || temp_at_2h || '°C) > 20°C. ';
  ELSIF temp_at_2h <= 15 THEN
    note_text := note_text || 'Stage 1 utmerket: ' || temp_at_2h || '°C etter 2t. ';
  ELSE
    note_text := note_text || 'Stage 1 godkjent: ' || temp_at_2h || '°C etter 2t. ';
  END IF;
  
  -- Check Stage 2 (6 hours)
  IF temp_at_6h > 10 THEN
    note_text := note_text || 'Ikke godkjent – Stage 2 mislykket: Temp etter 6t (' || temp_at_6h || '°C) > 10°C. Mat må kasseres.';
  ELSIF temp_at_6h <= 4 THEN
    note_text := note_text || 'Stage 2 utmerket: ' || temp_at_6h || '°C etter 6t. Klar for kjøleskap.';
  ELSE
    note_text := note_text || 'Stage 2 godkjent: ' || temp_at_6h || '°C etter 6t. Klar for kjøleskap.';
  END IF;
  
  RETURN TRIM(note_text);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to auto-calculate status and notes
CREATE OR REPLACE FUNCTION update_cooling_log_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate status based on temperatures
  NEW.status := calculate_cooling_status(
    NEW.temp_initial,
    NEW.temp_2h,
    NEW.temp_6h
  );
  
  -- Generate or append validation notes
  IF NEW.temp_initial IS NOT NULL AND NEW.temp_2h IS NOT NULL AND NEW.temp_6h IS NOT NULL THEN
    DECLARE
      auto_notes text;
    BEGIN
      auto_notes := generate_cooling_notes(
        NEW.temp_initial,
        NEW.temp_2h,
        NEW.temp_6h,
        NEW.status
      );
      
      -- Append to existing notes or create new
      IF NEW.notes IS NULL OR NEW.notes = '' THEN
        NEW.notes := auto_notes;
      ELSE
        -- Only append if auto notes aren't already there
        IF POSITION(auto_notes IN NEW.notes) = 0 THEN
          NEW.notes := NEW.notes || E'\n' || auto_notes;
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS cooling_log_validation_trigger ON cooling_logs;

CREATE TRIGGER cooling_log_validation_trigger
  BEFORE INSERT OR UPDATE ON cooling_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_cooling_log_status();
