/*
  # نظام جدولة الموظفين في HACCP
  
  1. جدول جديد
    - `employee_schedules` - جدول جدولة الموظفين
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `schedule_name` (text) - اسم الجدول (مثلاً "أسبوع 1-2", "أسبوع 3-4")
      - `day_of_week` (integer) - رقم اليوم (0=الأحد, 1=الإثنين, 6=السبت)
      - `is_active` (boolean) - فعال أم لا
      - `start_date` (date) - تاريخ البداية
      - `end_date` (date, nullable) - تاريخ النهاية (null = بدون نهاية)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. الأمان
    - تفعيل RLS
    - السماح بالقراءة للجميع
*/

CREATE TABLE IF NOT EXISTS employee_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  schedule_name text DEFAULT 'جدول افتراضي',
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_active boolean DEFAULT true,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_employee_schedules_employee ON employee_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_day ON employee_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_active ON employee_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_dates ON employee_schedules(start_date, end_date);

-- تفعيل RLS
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع
CREATE POLICY "Allow read access to all users"
  ON employee_schedules FOR SELECT
  USING (true);

-- سياسة الإدراج للجميع
CREATE POLICY "Allow insert for authenticated users"
  ON employee_schedules FOR INSERT
  WITH CHECK (true);

-- سياسة التحديث للجميع
CREATE POLICY "Allow update for authenticated users"
  ON employee_schedules FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- سياسة الحذف للجميع
CREATE POLICY "Allow delete for authenticated users"
  ON employee_schedules FOR DELETE
  USING (true);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_employee_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_schedules_timestamp
  BEFORE UPDATE ON employee_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_schedules_updated_at();

-- دالة للحصول على الموظفين المجدولين ليوم معين
CREATE OR REPLACE FUNCTION get_scheduled_employees_for_date(target_date date)
RETURNS TABLE (
  employee_id uuid,
  employee_name text,
  schedule_name text
) AS $$
DECLARE
  day_num integer;
BEGIN
  -- حساب رقم اليوم (0=الأحد, 1=الإثنين, 6=السبت)
  day_num := EXTRACT(DOW FROM target_date);
  
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    es.schedule_name
  FROM employees e
  INNER JOIN employee_schedules es ON e.id = es.employee_id
  WHERE 
    es.day_of_week = day_num
    AND es.is_active = true
    AND e.active = true
    AND e.deleted_at IS NULL
    AND es.start_date <= target_date
    AND (es.end_date IS NULL OR es.end_date >= target_date)
  ORDER BY e.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
