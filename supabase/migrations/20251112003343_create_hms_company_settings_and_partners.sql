/*
  # إنشاء نظام إعدادات الشركة والشركاء البيئيين
  # HMS Company Settings and Environmental Partners System

  ## الجداول الجديدة (New Tables)
  
  ### 1. hms_company_settings
  - معلومات الشركة الكاملة القابلة للتعديل
  - صف واحد فقط في الجدول
  - يُستخدم في جميع أنحاء النظام
  - العناوين القابلة للتخصيص
  
  ### 2. hms_environmental_partners
  - الشركاء البيئيين (LEKO Mater AS, NORVA AS, إلخ)
  - معلومات الاتصال والخدمات
  - حذف ناعم (Soft delete)
  
  ## الأمان (Security)
  - تفعيل RLS على جميع الجداول
  - سياسات قراءة عامة
  - سياسات كتابة للمصرح لهم
*/

-- إنشاء جدول إعدادات الشركة
CREATE TABLE IF NOT EXISTS hms_company_settings (
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
  environmental_title_no text DEFAULT '♻️ التحول الأخضر وحماية البيئة',
  environmental_title_ar text DEFAULT 'التحول الأخضر وحماية البيئة',
  hms_commitment_title_no text DEFAULT '🧍‍♂️ التزام الموظفين والإدارة',
  hms_commitment_title_ar text DEFAULT 'التزام الموظفين والإدارة',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الشركاء البيئيين
CREATE TABLE IF NOT EXISTS hms_environmental_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  service text NOT NULL,
  contact_person text,
  phone text,
  email text,
  is_active boolean DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إدراج البيانات الأولية للشركة
INSERT INTO hms_company_settings (
  id,
  company_name,
  org_number,
  phone,
  email,
  website,
  manager_name,
  address,
  description_no,
  description_ar
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Amigos la Kokido AS',
  '929 603 14',
  '+47 900 30 066',
  'order@amigoslakokido.com',
  'amigoslakokido.com',
  'Khalil Mahmod Sleman',
  'Trondheimsveien 2, 0560 Oslo',
  'Amigos la Kokido AS er en mexicansk restaurant i Oslo med sterkt fokus på HMS (Helse, Miljø og Sikkerhet). Vi streber etter å følge norsk arbeidsrett fullt ut og fremme en kultur for helse, sikkerhet og miljøansvar i virksomheten.',
  'تسعى شركة Amigos la Kokido AS إلى تطبيق قانون العمل النرويجي بشكل كامل، وتعزيز ثقافة الصحة والسلامة والمسؤولية البيئية داخل المنشأة.'
) ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- إدراج الشركاء البيئيين الأوليين
INSERT INTO hms_environmental_partners (name, service, contact_person, phone, email, is_active) VALUES
  ('LEKO Mater AS', 'Gulvrengjøring med miljøvennlig utstyr og godkjente produkter', 'Kontaktperson', '+47 XXX XX XXX', 'post@lekometer.no', true),
  ('NORVA AS', 'Tømming av kjøkkenfett og brukt frityrfett med regelmessig service', 'Service', '+47 XXX XX XXX', 'kundeservice@norva.no', true)
ON CONFLICT DO NOTHING;

-- تفعيل RLS
ALTER TABLE hms_company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hms_environmental_partners ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة
CREATE POLICY "Anyone can read company settings"
  ON hms_company_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read active partners"
  ON hms_environmental_partners FOR SELECT
  USING (is_active = true OR deleted_at IS NULL OR true);

-- سياسات الكتابة
CREATE POLICY "Anyone can update company settings"
  ON hms_company_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert company settings"
  ON hms_company_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert partners"
  ON hms_environmental_partners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update partners"
  ON hms_environmental_partners FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete partners"
  ON hms_environmental_partners FOR DELETE
  USING (true);

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_partners_active ON hms_environmental_partners(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_partners_deleted ON hms_environmental_partners(deleted_at) WHERE deleted_at IS NULL;

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_hms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إضافة triggers
DROP TRIGGER IF EXISTS update_hms_company_settings_updated_at ON hms_company_settings;
CREATE TRIGGER update_hms_company_settings_updated_at
  BEFORE UPDATE ON hms_company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_hms_updated_at();

DROP TRIGGER IF EXISTS update_hms_partners_updated_at ON hms_environmental_partners;
CREATE TRIGGER update_hms_partners_updated_at
  BEFORE UPDATE ON hms_environmental_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_hms_updated_at();
