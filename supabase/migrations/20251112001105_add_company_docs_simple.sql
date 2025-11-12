/*
  # إضافة معلومات الشركة والمستندات
  
  جداول بسيطة بدون تعقيدات
*/

-- جدول معلومات الشركة
CREATE TABLE IF NOT EXISTS hms_company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Amigos la Kokido AS',
  org_number TEXT NOT NULL DEFAULT 'XXXX XXXX XX',
  phone TEXT NOT NULL DEFAULT '+47 XXXX XXXX',
  email TEXT NOT NULL DEFAULT 'xxxxxxxxxxxx',
  website TEXT DEFAULT 'xxxxxxxx',
  manager_name TEXT NOT NULL DEFAULT 'xxxxxxxxxxx',
  address TEXT NOT NULL DEFAULT 'xxxxxxxxxxxxx',
  environmental_commitment TEXT,
  safety_policy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول الأقسام
CREATE TABLE IF NOT EXISTS hms_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_no TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT 'slate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول المستندات
CREATE TABLE IF NOT EXISTS hms_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  department_id UUID,
  category TEXT NOT NULL,
  uploaded_by_name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إدراج بيانات
INSERT INTO hms_company_info (
  company_name,
  environmental_commitment,
  safety_policy
) SELECT 
  'Amigos la Kokido AS',
  'تسعى شركة Amigos la Kokido AS إلى تطبيق قانون العمل النرويجي بشكل كامل، وتعزيز ثقافة الصحة والسلامة والمسؤولية البيئية داخل المنشأة.',
  'تهدف إدارة المطعم إلى توفير بيئة عمل آمنة ومستدامة لجميع الموظفين.'
WHERE NOT EXISTS (SELECT 1 FROM hms_company_info LIMIT 1);

INSERT INTO hms_departments (name, name_no, name_ar, icon, color) 
SELECT * FROM (VALUES
  ('Kitchen', 'Kjøkken', 'المطبخ', 'chef-hat', 'red'),
  ('Cleaning', 'Rengjøring', 'التنظيف', 'sparkles', 'blue'),
  ('Storage', 'Lager', 'المخزن', 'package', 'amber'),
  ('Service', 'Servering', 'الخدمة', 'utensils', 'emerald'),
  ('Management', 'Ledelse', 'الإدارة', 'briefcase', 'purple')
) AS v(name, name_no, name_ar, icon, color)
WHERE NOT EXISTS (SELECT 1 FROM hms_departments WHERE name = v.name);

-- فهارس
CREATE INDEX IF NOT EXISTS idx_hms_documents_dept ON hms_documents(department_id);
CREATE INDEX IF NOT EXISTS idx_hms_documents_cat ON hms_documents(category);
CREATE INDEX IF NOT EXISTS idx_hms_documents_date ON hms_documents(created_at DESC);

-- RLS
ALTER TABLE hms_company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all company_info" ON hms_company_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all departments" ON hms_departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all documents" ON hms_documents FOR ALL USING (true) WITH CHECK (true);
