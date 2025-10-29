/*
  # Fix daily_reports generated_by constraint

  ## Changes
  - Make generated_by column nullable
  - Remove foreign key constraint to allow report generation without user authentication
  
  ## Reason
  System no longer uses authentication, reports should be generated independently
*/

-- Drop foreign key constraint if exists
ALTER TABLE daily_reports 
DROP CONSTRAINT IF EXISTS daily_reports_generated_by_fkey;

-- Make generated_by nullable
ALTER TABLE daily_reports 
ALTER COLUMN generated_by DROP NOT NULL;
