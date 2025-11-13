/*
  # إنشاء جدول Verneombud (مندوب السلامة)

  1. الجدول الجديد
    - `hms_safety_representative`
      - `id` (uuid, primary key)
      - `name` (text) - اسم مندوب السلامة
      - `position` (text) - المنصب الوظيفي
      - `phone` (text) - رقم الهاتف
      - `email` (text) - البريد الإلكتروني
      - `appointed_date` (date) - تاريخ التعيين
      - `term_years` (integer) - مدة الخدمة بالسنوات
      - `manager_name` (text) - اسم المدير
      - `manager_signature_date` (date) - تاريخ توقيع المدير
      - `rep_signature_date` (date) - تاريخ توقيع المندوب
      - `company_name` (text) - اسم الشركة
      - `company_org_number` (text) - رقم المنظمة
      - `company_address` (text) - عنوان الشركة
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS
    - سياسات للسماح بالقراءة والتعديل للجميع (نظام داخلي)
*/

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS hms_safety_representative (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  appointed_date date NOT NULL DEFAULT CURRENT_DATE,
  term_years integer DEFAULT 2,
  manager_name text NOT NULL,
  manager_signature_date date,
  rep_signature_date date,
  company_name text DEFAULT 'Amigos la Kokido AS',
  company_org_number text,
  company_address text DEFAULT 'Hollendergata 2, 1607 Fredrikstad',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE hms_safety_representative ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Allow public read access to safety representative"
  ON hms_safety_representative
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to safety representative"
  ON hms_safety_representative
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to safety representative"
  ON hms_safety_representative
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from safety representative"
  ON hms_safety_representative
  FOR DELETE
  USING (true);

-- إنشاء فهرس
CREATE INDEX IF NOT EXISTS idx_safety_rep_appointed_date 
  ON hms_safety_representative(appointed_date DESC);
