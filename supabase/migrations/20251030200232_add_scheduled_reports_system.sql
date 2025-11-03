/*
  # إضافة نظام التقارير المجدولة

  1. جدول جديد
    - `scheduled_reports_config`
      - `id` (uuid, primary key)
      - `is_enabled` (boolean) - تفعيل/إيقاف التقارير التلقائية
      - `schedule_time` (time) - وقت التنفيذ اليومي (افتراضي 23:00)
      - `last_run` (timestamptz) - آخر تشغيل
      - `next_run` (timestamptz) - التشغيل القادم
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. الأمان
    - تفعيل RLS على الجدول
    - سماح القراءة والتعديل للجميع (لأنه جدول إعدادات واحد)
  
  3. البيانات الابتدائية
    - إدراج إعداد افتراضي مفعّل عند الساعة 23:00
*/

-- إنشاء جدول إعدادات التقارير المجدولة
CREATE TABLE IF NOT EXISTS scheduled_reports_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT true,
  schedule_time time DEFAULT '23:00:00',
  last_run timestamptz,
  next_run timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE scheduled_reports_config ENABLE ROW LEVEL SECURITY;

-- سياسات RLS - السماح للجميع بالقراءة والتعديل
CREATE POLICY "السماح للجميع بقراءة إعدادات الجدولة"
  ON scheduled_reports_config
  FOR SELECT
  USING (true);

CREATE POLICY "السماح للجميع بتحديث إعدادات الجدولة"
  ON scheduled_reports_config
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "السماح للجميع بإدراج إعدادات الجدولة"
  ON scheduled_reports_config
  FOR INSERT
  WITH CHECK (true);

-- إدراج الإعدادات الافتراضية (صف واحد فقط)
INSERT INTO scheduled_reports_config (is_enabled, schedule_time, next_run)
VALUES (
  true,
  '23:00:00',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '23:00:00')
)
ON CONFLICT DO NOTHING;

-- دالة لتحديث next_run تلقائياً
CREATE OR REPLACE FUNCTION update_next_run()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.schedule_time IS DISTINCT FROM OLD.schedule_time THEN
    NEW.next_run := CURRENT_DATE + INTERVAL '1 day' + NEW.schedule_time;
    IF NEW.next_run < NOW() THEN
      NEW.next_run := NEW.next_run + INTERVAL '1 day';
    END IF;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل التحديث التلقائي
DROP TRIGGER IF EXISTS update_next_run_trigger ON scheduled_reports_config;
CREATE TRIGGER update_next_run_trigger
  BEFORE UPDATE ON scheduled_reports_config
  FOR EACH ROW
  EXECUTE FUNCTION update_next_run();