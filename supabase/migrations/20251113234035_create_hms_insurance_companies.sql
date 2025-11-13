/*
  # Create HMS Insurance Companies Table

  1. New Tables
    - `hms_insurance_companies`
      - `id` (uuid, primary key)
      - `company_name` (text) - اسم شركة التأمين
      - `insurance_type` (text) - نوع التأمين (مسؤولية، حريق، سيارات، إلخ)
      - `policy_number` (text) - رقم البوليصة
      - `contact_person` (text) - الشخص المسؤول
      - `phone` (text) - رقم الهاتف
      - `email` (text) - البريد الإلكتروني
      - `coverage_amount` (numeric) - مبلغ التغطية
      - `premium_amount` (numeric) - مبلغ القسط السنوي
      - `start_date` (date) - تاريخ البداية
      - `end_date` (date) - تاريخ الانتهاء
      - `notes` (text) - ملاحظات إضافية
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `hms_insurance_companies` table
    - Add policies for public access (since HMS system is open)
*/

CREATE TABLE IF NOT EXISTS hms_insurance_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  insurance_type text NOT NULL,
  policy_number text,
  contact_person text,
  phone text,
  email text,
  coverage_amount numeric DEFAULT 0,
  premium_amount numeric DEFAULT 0,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hms_insurance_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to insurance companies"
  ON hms_insurance_companies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to insurance companies"
  ON hms_insurance_companies
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to insurance companies"
  ON hms_insurance_companies
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to insurance companies"
  ON hms_insurance_companies
  FOR DELETE
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_insurance_companies_type ON hms_insurance_companies(insurance_type);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_end_date ON hms_insurance_companies(end_date);
