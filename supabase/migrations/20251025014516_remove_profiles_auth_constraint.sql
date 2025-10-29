/*
  # Remove auth.users foreign key constraint from profiles

  ## Changes
  - Drop foreign key constraint linking profiles.id to auth.users.id
  - This allows creating standalone user profiles without authentication

  ## Reason
  The system no longer uses authentication, so profiles should be independent
*/

-- Drop the foreign key constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;
