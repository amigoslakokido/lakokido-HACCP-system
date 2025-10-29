/*
  # Add Notes Field to Cleaning Logs
  
  1. Changes
    - Add `notes` column to `cleaning_logs` table
      - Type: text (optional)
      - Purpose: Allow staff to add short comments/notes when completing cleaning tasks
      
  2. Notes
    - This allows better tracking and communication about cleaning tasks
    - Field is optional to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cleaning_logs' AND column_name = 'notes'
  ) THEN
    ALTER TABLE cleaning_logs ADD COLUMN notes text DEFAULT '';
  END IF;
END $$;
