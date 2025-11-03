/*
  # Create Daily Routine Tasks System

  1. New Tables
    - `daily_routine_templates` - Predefined daily routine tasks (bilingual: Arabic & Norwegian)
    - `daily_routine_logs` - Daily execution logs for routine tasks

  2. Security
    - Enable RLS on all tables
    - Public access policies for all operations (no authentication required)

  3. Notes
    - Support bilingual task names (Arabic and Norwegian)
    - Track task completion status (completed/incomplete)
    - Allow image attachments for proof
    - Store employee who performed the task
*/

-- Create daily_routine_templates table
CREATE TABLE IF NOT EXISTS daily_routine_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name_ar text NOT NULL,
  task_name_no text NOT NULL,
  icon text DEFAULT '📋',
  category text NOT NULL CHECK (category IN ('cleaning', 'supplies', 'maintenance', 'other')) DEFAULT 'other',
  active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_routine_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read daily routine templates" ON daily_routine_templates FOR SELECT USING (true);
CREATE POLICY "Public create daily routine templates" ON daily_routine_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update daily routine templates" ON daily_routine_templates FOR UPDATE USING (true);
CREATE POLICY "Public delete daily routine templates" ON daily_routine_templates FOR DELETE USING (true);

-- Create daily_routine_logs table
CREATE TABLE IF NOT EXISTS daily_routine_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES daily_routine_templates ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees ON DELETE CASCADE,
  task_date date NOT NULL DEFAULT CURRENT_DATE,
  task_time time NOT NULL DEFAULT CURRENT_TIME,
  status text NOT NULL CHECK (status IN ('completed', 'incomplete')) DEFAULT 'completed',
  notes text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_routine_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read daily routine logs" ON daily_routine_logs FOR SELECT USING (true);
CREATE POLICY "Public create daily routine logs" ON daily_routine_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update daily routine logs" ON daily_routine_logs FOR UPDATE USING (true);
CREATE POLICY "Public delete daily routine logs" ON daily_routine_logs FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_routine_templates_active ON daily_routine_templates(active);
CREATE INDEX IF NOT EXISTS idx_daily_routine_templates_order ON daily_routine_templates(display_order);
CREATE INDEX IF NOT EXISTS idx_daily_routine_logs_date ON daily_routine_logs(task_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_routine_logs_task ON daily_routine_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_daily_routine_logs_employee ON daily_routine_logs(employee_id);

-- Insert initial routine tasks (bilingual)
INSERT INTO daily_routine_templates (task_name_ar, task_name_no, icon, category, display_order) VALUES
('تعبئة براد المشروبات', 'Fylle kjøleskapet med drikkevarer', '🧃', 'supplies', 1),
('تعبئة محارم الزبائن', 'Fylle på servietter til kundene', '🧻', 'supplies', 2),
('تعبئة السكاكين والشوك والتأكد من نظافتها', 'Fylle på kniver og gafler og sjekke renslighet', '🍴', 'cleaning', 3),
('تعبئة محارم الحمامات', 'Fylle på toalettpapir', '🚻', 'supplies', 4),
('التأكد من نظافة الصحون', 'Sjekke at tallerkene er rene', '🍽️', 'cleaning', 5),
('تنظيف الطاولات', 'Rengjøre bordene', '🧹', 'cleaning', 6),
('فحص نظافة المراحيض', 'Inspisere toalettrenslighet', '🚽', 'cleaning', 7),
('التأكد من توفر الصابون', 'Sjekke at det er nok såpe', '🧼', 'supplies', 8);