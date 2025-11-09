/*
  # Add missing columns to incident_attachments table

  1. Changes
    - Add `file_size` column to store file size in bytes
    - Add `uploaded_by` column to track who uploaded the file
  
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if columns already exist
    - file_size is nullable for backward compatibility
    - uploaded_by references employees table
*/

-- Add file_size column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incident_attachments' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE incident_attachments ADD COLUMN file_size bigint;
  END IF;
END $$;

-- Add uploaded_by column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incident_attachments' AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE incident_attachments ADD COLUMN uploaded_by uuid REFERENCES employees(id);
  END IF;
END $$;