/*
  # إضافة إعدادات متقدمة للتنبيهات - Advanced Notification Settings

  1. تحديث جدول notification_settings
    - إضافة أعمدة للصوت:
      - `sound_type` (text) - نوع الصوت (bell, chime, alert, alarm, gentle)
      - `sound_volume` (integer) - مستوى الصوت (0-100)
      - `sound_repeat` (integer) - عدد مرات التكرار (1-5)
      - `sound_interval` (integer) - الفترة بين التكرارات بالثواني (1-60)
    
    - إضافة أعمدة للتنبيهات المرئية:
      - `alert_position` (text) - موضع التنبيه (top-right, top-left, top-center, bottom-right, bottom-left)
      - `alert_size` (text) - حجم التنبيه (small, medium, large)
      - `alert_animation` (text) - نوع الحركة (slide, fade, bounce, zoom)
      - `alert_duration` (integer) - مدة بقاء التنبيه بالثواني (3-30)
      - `alert_auto_dismiss` (boolean) - إخفاء تلقائي
      - `show_alert_sound_icon` (boolean) - إظهار أيقونة الصوت
      - `vibrate_enabled` (boolean) - تفعيل الاهتزاز (للموبايل)

  2. القيم الافتراضية
    - جميع القيم مناسبة للاستخدام الفوري
*/

-- إضافة أعمدة إعدادات الصوت
ALTER TABLE notification_settings
ADD COLUMN IF NOT EXISTS sound_type text DEFAULT 'bell',
ADD COLUMN IF NOT EXISTS sound_volume integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS sound_repeat integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS sound_interval integer DEFAULT 2;

-- إضافة أعمدة إعدادات التنبيهات المرئية
ALTER TABLE notification_settings
ADD COLUMN IF NOT EXISTS alert_position text DEFAULT 'top-right',
ADD COLUMN IF NOT EXISTS alert_size text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS alert_animation text DEFAULT 'slide',
ADD COLUMN IF NOT EXISTS alert_duration integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS alert_auto_dismiss boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_alert_sound_icon boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS vibrate_enabled boolean DEFAULT false;

-- إضافة قيود للتحقق من صحة البيانات
ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_sound_type,
ADD CONSTRAINT valid_sound_type 
  CHECK (sound_type IN ('bell', 'chime', 'alert', 'alarm', 'gentle'));

ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_sound_volume,
ADD CONSTRAINT valid_sound_volume 
  CHECK (sound_volume >= 0 AND sound_volume <= 100);

ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_sound_repeat,
ADD CONSTRAINT valid_sound_repeat 
  CHECK (sound_repeat >= 1 AND sound_repeat <= 5);

ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_sound_interval,
ADD CONSTRAINT valid_sound_interval 
  CHECK (sound_interval >= 1 AND sound_interval <= 60);

ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_alert_position,
ADD CONSTRAINT valid_alert_position 
  CHECK (alert_position IN ('top-right', 'top-left', 'top-center', 'bottom-right', 'bottom-left', 'bottom-center'));

ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_alert_size,
ADD CONSTRAINT valid_alert_size 
  CHECK (alert_size IN ('small', 'medium', 'large'));

ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_alert_animation,
ADD CONSTRAINT valid_alert_animation 
  CHECK (alert_animation IN ('slide', 'fade', 'bounce', 'zoom', 'shake'));

ALTER TABLE notification_settings
DROP CONSTRAINT IF EXISTS valid_alert_duration,
ADD CONSTRAINT valid_alert_duration 
  CHECK (alert_duration >= 3 AND alert_duration <= 30);

-- تحديث السجل الموجود بالقيم الافتراضية
UPDATE notification_settings
SET 
  sound_type = COALESCE(sound_type, 'bell'),
  sound_volume = COALESCE(sound_volume, 30),
  sound_repeat = COALESCE(sound_repeat, 1),
  sound_interval = COALESCE(sound_interval, 2),
  alert_position = COALESCE(alert_position, 'top-right'),
  alert_size = COALESCE(alert_size, 'medium'),
  alert_animation = COALESCE(alert_animation, 'slide'),
  alert_duration = COALESCE(alert_duration, 10),
  alert_auto_dismiss = COALESCE(alert_auto_dismiss, false),
  show_alert_sound_icon = COALESCE(show_alert_sound_icon, true),
  vibrate_enabled = COALESCE(vibrate_enabled, false);
