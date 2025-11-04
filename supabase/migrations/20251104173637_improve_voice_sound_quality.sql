/*
  # Improve Voice Sound Quality

  1. Changes
    - Update default voice_rate from 0.9 to 0.8 (slower, clearer)
    - Update default voice_pitch from 1.0 to 0.8 (deeper, less shrill)
    - Update existing voice settings to new defaults for better quality

  2. Why This Fix?
    - Users reported voice sounds were too shrill (high pitch)
    - Voice was too weak and hard to hear clearly
    - Slower rate = clearer pronunciation
    - Lower pitch = more natural, less harsh sound

  3. Technical Details
    - voice_rate: 0.8 = 80% of normal speed (was 90%)
    - voice_pitch: 0.8 = deeper tone (was 1.0 = normal)
    - volume: 90% for voice sounds (was variable)
*/

-- Update column defaults for new records
ALTER TABLE notification_settings
ALTER COLUMN voice_rate SET DEFAULT 0.8;

ALTER TABLE notification_settings
ALTER COLUMN voice_pitch SET DEFAULT 0.8;

-- Update existing voice settings to better defaults
UPDATE notification_settings
SET
  voice_rate = 0.8,
  voice_pitch = 0.8,
  sound_volume = CASE
    WHEN sound_type IN ('voice_ar', 'voice_no') THEN 90
    ELSE sound_volume
  END
WHERE sound_type IN ('voice_ar', 'voice_no');
