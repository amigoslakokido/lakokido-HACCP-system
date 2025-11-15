/*
  # Add subcategory column to hms_documents

  1. Changes
    - Add `subcategory` column to hms_documents table for better organization
    - Add index on subcategory for performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add subcategory column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hms_documents' AND column_name = 'subcategory'
  ) THEN
    ALTER TABLE hms_documents ADD COLUMN subcategory text DEFAULT '';
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_documents_subcategory ON hms_documents(subcategory);
