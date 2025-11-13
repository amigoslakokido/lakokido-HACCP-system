/*
  # إنشاء جدول Personalliste

  1. الجدول الجديد
    - `hms_personnel`
      - `id` (uuid, primary key)
      - `full_name` (text) - الاسم الكامل
      - `position` (text) - المنصب
      - `phone` (text) - رقم الهاتف
      - `email` (text) - البريد الإلكتروني
      - `hire_date` (date) - تاريخ التوظيف
      - `employment_type` (text) - نوع التوظيف
      - `department` (text) - القسم
      - `emergency_contact_name` (text) - اسم جهة الاتصال للطوارئ
      - `emergency_contact_phone` (text) - رقم جهة الاتصال للطوارئ
      - `notes` (text) - ملاحظات
      - `status` (text) - الحالة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS
    - سياسات للسماح بالوصول الكامل
*/

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS hms_personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  employment_type text NOT NULL DEFAULT 'Heltid',
  department text NOT NULL,
  emergency_contact_name text DEFAULT '',
  emergency_contact_phone text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'Aktiv',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE hms_personnel ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Allow public read access to personnel"
  ON hms_personnel
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to personnel"
  ON hms_personnel
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to personnel"
  ON hms_personnel
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from personnel"
  ON hms_personnel
  FOR DELETE
  USING (true);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_personnel_status ON hms_personnel(status);
CREATE INDEX IF NOT EXISTS idx_personnel_employment_type ON hms_personnel(employment_type);
CREATE INDEX IF NOT EXISTS idx_personnel_department ON hms_personnel(department);
CREATE INDEX IF NOT EXISTS idx_personnel_hire_date ON hms_personnel(hire_date DESC);
CREATE INDEX IF NOT EXISTS idx_personnel_created_at ON hms_personnel(created_at DESC);
