/*
  # Add Voice Message Settings

  1. Changes
    - Add `voice_message_ar` column to notification_settings table
      - Text message for Arabic voice notifications
      - Default: 'تنبيه! يرجى إكمال المهام الروتينية اليومية'

    - Add `voice_message_no` column to notification_settings table
      - Text message for Norwegian voice notifications
      - Default: 'Advarsel! Vennligst fullfør de daglige rutineoppgavene'

    - Add `voice_rate` column to notification_settings table
      - Speech rate (0.1 to 2.0)
      - Default: 0.9 (slightly slower for clarity)

    - Add `voice_pitch` column to notification_settings table
      - Speech pitch (0.0 to 2.0)
      - Default: 1.0 (normal pitch)

  2. Security
    - No RLS changes needed (inherits from table)
*/

-- Add voice message columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_settings' AND column_name = 'voice_message_ar'
  ) THEN
    ALTER TABLE notification_settings
    ADD COLUMN voice_message_ar TEXT DEFAULT 'تنبيه! يرجى إكمال المهام الروتينية اليومية';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_settings' AND column_name = 'voice_message_no'
  ) THEN
    ALTER TABLE notification_settings
    ADD COLUMN voice_message_no TEXT DEFAULT 'Advarsel! Vennligst fullfør de daglige rutineoppgavene';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_settings' AND column_name = 'voice_rate'
  ) THEN
    ALTER TABLE notification_settings
    ADD COLUMN voice_rate DECIMAL(3,2) DEFAULT 0.9 CHECK (voice_rate >= 0.1 AND voice_rate <= 2.0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notification_settings' AND column_name = 'voice_pitch'
  ) THEN
    ALTER TABLE notification_settings
    ADD COLUMN voice_pitch DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_pitch >= 0.0 AND voice_pitch <= 2.0);
  END IF;
END $$;

-- Update existing records with default values
UPDATE notification_settings
SET
  voice_message_ar = COALESCE(voice_message_ar, 'تنبيه! يرجى إكمال المهام الروتينية اليومية'),
  voice_message_no = COALESCE(voice_message_no, 'Advarsel! Vennligst fullfør de daglige rutineoppgavene'),
  voice_rate = COALESCE(voice_rate, 0.9),
  voice_pitch = COALESCE(voice_pitch, 1.0)
WHERE voice_message_ar IS NULL
   OR voice_message_no IS NULL
   OR voice_rate IS NULL
   OR voice_pitch IS NULL;
