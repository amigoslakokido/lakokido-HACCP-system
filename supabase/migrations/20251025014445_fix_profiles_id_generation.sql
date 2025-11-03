/*
  # Fix profiles table ID generation

  ## Changes
  - Add default value for id column to auto-generate UUIDs
  - This allows inserting users without manually providing an ID

  ## Security
  - No changes to RLS policies
*/

-- Add default UUID generation for profiles.id
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
