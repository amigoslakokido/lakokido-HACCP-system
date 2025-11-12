/*
  # إضافة نظام إدارة الشركة والموظفين والمستندات
  # Company, Employees, and Documents Management System

  ## الجداول الجديدة (New Tables)
  
  ### 1. company_info
  - معلومات الشركة الأساسية (اسم، عنوان، أرقام تواصل، مدير)
  - يحتوي على صف واحد فقط يتم تحديثه
  - يُستخدم في جميع التقارير والمستندات الرسمية
  
  ### 2. employees (تحديث)
  - إضافة أعمدة جديدة للموظفين الموجودين
  - الهاتف، البريد، الوظيفة بالعربية، القسم
  - دعم الحذف الناعم (soft delete)
  
  ### 3. departments
  - الأقسام داخل المطعم (مطبخ، خدمة، إدارة، مخزن، تنظيف)
  
  ### 4. company_documents
  - مستندات الشركة مع تصنيف كامل
  
  ## الأمان (Security)
  - تفعيل RLS على جميع الجداول الجديدة
  - سياسات قراءة وكتابة مناسبة
*/

-- إنشاء جدول معلومات الشركة
CREATE TABLE IF NOT EXISTS company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Amigos la Kokido AS',
  org_number text NOT NULL DEFAULT '929 603 14',
  phone text NOT NULL DEFAULT '+47 900 30 066',
  email text NOT NULL DEFAULT 'order@amigoslakokido.com',
  website text DEFAULT 'amigoslakokido.com',
  manager_name text NOT NULL DEFAULT 'Khalil Mahmod Sleman',
  address text NOT NULL DEFAULT 'Trondheimsveien 2, 0560 Oslo',
  description_no text,
  description_ar text,
  environmental_policy text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الأقسام
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_no text NOT NULL,
  name_ar text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- إضافة أعمدة جديدة لجدول الموظفين الموجود
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'phone'
  ) THEN
    ALTER TABLE employees ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'email'
  ) THEN
    ALTER TABLE employees ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'position_no'
  ) THEN
    ALTER TABLE employees ADD COLUMN position_no text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'position_ar'
  ) THEN
    ALTER TABLE employees ADD COLUMN position_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN department_id uuid REFERENCES departments(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'hire_date'
  ) THEN
    ALTER TABLE employees ADD COLUMN hire_date date DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE employees ADD COLUMN deleted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'notes'
  ) THEN
    ALTER TABLE employees ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE employees ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- إنشاء جدول مستندات الشركة
CREATE TABLE IF NOT EXISTS company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  category text NOT NULL CHECK (category IN (
    'maintenance', 'cleaning', 'safety', 'training', 
    'contract', 'certificate', 'inspection', 'report', 'other'
  )),
  department_id uuid REFERENCES departments(id),
  uploaded_by uuid REFERENCES employees(id),
  upload_date timestamptz DEFAULT now(),
  document_date date,
  is_public boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- إدراج صف واحد لمعلومات الشركة
INSERT INTO company_info (
  id, company_name, org_number, phone, email, 
  website, manager_name, address,
  description_no, description_ar, environmental_policy
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Amigos la Kokido AS',
  '929 603 14',
  '+47 900 30 066',
  'order@amigoslakokido.com',
  'amigoslakokido.com',
  'Khalil Mahmod Sleman',
  'Trondheimsveien 2, 0560 Oslo',
  'Mexikansk restaurant i Oslo med fokus på HMS og miljø',
  'مطعم مكسيكي في أوسلو يركز على الصحة والسلامة والبيئة',
  'Vi bruker elektriske biler til levering, samarbeider med LEKO Mater AS for miljøvennlig rengjøring, og NORVA AS for håndtering av matolje.'
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  org_number = EXCLUDED.org_number,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  manager_name = EXCLUDED.manager_name,
  address = EXCLUDED.address,
  updated_at = now();

-- إدراج الأقسام الأساسية
INSERT INTO departments (id, name_no, name_ar, description) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Kjøkken', 'المطبخ', 'Matproduksjon og tilberedning'),
  ('d2222222-2222-2222-2222-222222222222', 'Service', 'الخدمة', 'Kundeservice og servering'),
  ('d3333333-3333-3333-3333-333333333333', 'Lager', 'المخزن', 'Varemottak og lagerstyring'),
  ('d4444444-4444-4444-4444-444444444444', 'Rengjøring', 'التنظيف', 'Renhold og hygiene'),
  ('d5555555-5555-5555-5555-555555555555', 'Administrasjon', 'الإدارة', 'Administrasjon og ledelse')
ON CONFLICT (id) DO NOTHING;

-- تفعيل RLS
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للقراءة العامة
CREATE POLICY "Anyone can read company info"
  ON company_info FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read departments"
  ON departments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read documents"
  ON company_documents FOR SELECT
  USING (true);

-- سياسات الكتابة
CREATE POLICY "Anyone can update company info"
  ON company_info FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert documents"
  ON company_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update documents"
  ON company_documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete documents"
  ON company_documents FOR DELETE
  USING (true);

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_employees_deleted ON employees(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_department ON company_documents(department_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON company_documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON company_documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON company_documents(uploaded_by);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إضافة triggers
DROP TRIGGER IF EXISTS update_company_info_updated_at ON company_info;
CREATE TRIGGER update_company_info_updated_at
  BEFORE UPDATE ON company_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
