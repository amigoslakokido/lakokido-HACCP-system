/*
  # إضافة فئة تقارير الحوادث الخطرة

  1. تعديلات
    - إضافة عمود `report_category` إلى جدول daily_reports
    - القيم الممكنة: 'daily', 'routine', 'critical'
    
  2. ملاحظات
    - التقارير الموجودة ستكون 'daily' بشكل افتراضي
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_reports' AND column_name = 'report_category'
  ) THEN
    ALTER TABLE daily_reports 
    ADD COLUMN report_category text DEFAULT 'daily' CHECK (report_category IN ('daily', 'routine', 'critical'));
    
    CREATE INDEX IF NOT EXISTS idx_daily_reports_category ON daily_reports(report_category);
  END IF;
END $$;

-- تحديث التقارير الحالية
UPDATE daily_reports SET report_category = 'daily' WHERE report_category IS NULL;
