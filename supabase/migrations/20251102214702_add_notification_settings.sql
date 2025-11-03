/*
  # إضافة إعدادات التنبيهات - Notification Settings

  1. جدول جديد
    - `notification_settings`
      - `id` (uuid, primary key)
      - `sound_enabled` (boolean) - تفعيل/إيقاف الصوت
      - `in_app_alerts` (boolean) - التنبيهات داخل التطبيق
      - `email_notifications` (boolean) - تنبيهات البريد الإلكتروني
      - `warning_time` (time) - وقت بدء التحذير الأصفر (9:00 صباحاً)
      - `danger_time` (time) - وقت بدء التحذير البرتقالي (12:00 ظهراً)
      - `critical_time` (time) - وقت بدء التحذير الأحمر (3:00 مساءً)
      - `email_recipients` (text array) - قائمة بالإيميلات
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS
    - سماح للجميع بالقراءة
    - سماح للجميع بالتعديل (لأنها إعدادات عامة للنظام)

  3. ملاحظات
    - سيكون هناك صف واحد فقط لإعدادات النظام
    - القيم الافتراضية مناسبة للاستخدام الفوري
*/

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sound_enabled boolean DEFAULT true,
  in_app_alerts boolean DEFAULT true,
  email_notifications boolean DEFAULT false,
  warning_time time DEFAULT '09:00:00',
  danger_time time DEFAULT '12:00:00',
  critical_time time DEFAULT '15:00:00',
  email_recipients text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Allow public read access to notification_settings"
  ON notification_settings
  FOR SELECT
  TO public
  USING (true);

-- السماح للجميع بالتعديل (إعدادات النظام)
CREATE POLICY "Allow public update access to notification_settings"
  ON notification_settings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- السماح بالإدراج (أول مرة فقط)
CREATE POLICY "Allow public insert to notification_settings"
  ON notification_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- إدراج الإعدادات الافتراضية
INSERT INTO notification_settings (
  sound_enabled,
  in_app_alerts,
  email_notifications,
  warning_time,
  danger_time,
  critical_time,
  email_recipients
) VALUES (
  true,
  true,
  false,
  '09:00:00',
  '12:00:00',
  '15:00:00',
  ARRAY[]::text[]
)
ON CONFLICT DO NOTHING;

-- إضافة Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_settings_timestamp
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();
