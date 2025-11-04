/*
  # Fix Sound Type Constraint to Include Voice Sounds

  1. Changes
    - Drop old `valid_sound_type` constraint
    - Add new constraint that includes all sound types:
      * Traditional sounds: bell, chime, alert, alarm, gentle
      * Additional sounds: urgent, siren, loud_beep
      * Voice sounds: voice_ar, voice_no (NEW!)

  2. Why This Fix?
    - The old constraint was blocking voice_ar and voice_no from being saved
    - Users couldn't save voice notification settings
    - Error: "new row violates check constraint valid_sound_type"

  3. Security
    - No RLS changes needed
    - Constraint still validates sound_type values
    - Now accepts all defined sound types
*/

-- Remove old constraint
ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_sound_type;

-- Add new constraint with all sound types including voice sounds
ALTER TABLE notification_settings
ADD CONSTRAINT valid_sound_type
CHECK (sound_type = ANY (ARRAY[
  'bell',
  'chime',
  'alert',
  'alarm',
  'gentle',
  'urgent',
  'siren',
  'loud_beep',
  'voice_ar',
  'voice_no'
]));
