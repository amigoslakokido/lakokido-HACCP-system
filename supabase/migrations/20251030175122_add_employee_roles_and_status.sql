/*
  # Add Employee Roles and Status Management

  1. Changes to `employees` table
    - Add `role` column (daglig_leder, kontrollor, medarbeider)
    - Add `status` column (active, paused)
    - Role determines responsibilities in reports
    - Status allows pausing employees without deleting them
  
  2. Default Values
    - Existing employees set to 'medarbeider' role and 'active' status
    - First employee upgraded to 'daglig_leder'
  
  3. Notes
    - Historical reports preserve employee names even if paused/deleted
    - Foreign keys use ON DELETE SET NULL to preserve names
    - 70% of temperature readings assigned to managers (daglig_leder + kontrollor)
    - Hygiene checks only for managers
*/

-- Add role and status columns to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'role'
  ) THEN
    ALTER TABLE employees 
    ADD COLUMN role text NOT NULL DEFAULT 'medarbeider'
    CHECK (role IN ('daglig_leder', 'kontrollor', 'medarbeider'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'status'
  ) THEN
    ALTER TABLE employees 
    ADD COLUMN status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused'));
  END IF;
END $$;

-- Set first employee as daglig_leder if exists
UPDATE employees 
SET role = 'daglig_leder' 
WHERE id = (SELECT id FROM employees ORDER BY created_at LIMIT 1);

-- Ensure foreign keys preserve employee names in reports (ON DELETE SET NULL)
-- This allows reports to keep employee names even after deletion

-- Update temperature_logs foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'temperature_logs_recorded_by_fkey'
  ) THEN
    ALTER TABLE temperature_logs 
    DROP CONSTRAINT temperature_logs_recorded_by_fkey;
  END IF;
  
  ALTER TABLE temperature_logs
  ADD CONSTRAINT temperature_logs_recorded_by_fkey
  FOREIGN KEY (recorded_by) REFERENCES employees(id) ON DELETE SET NULL;
END $$;

-- Update cleaning_logs foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cleaning_logs_completed_by_fkey'
  ) THEN
    ALTER TABLE cleaning_logs 
    DROP CONSTRAINT cleaning_logs_completed_by_fkey;
  END IF;
  
  ALTER TABLE cleaning_logs
  ADD CONSTRAINT cleaning_logs_completed_by_fkey
  FOREIGN KEY (completed_by) REFERENCES employees(id) ON DELETE SET NULL;
END $$;

-- Create index for active employees queries
CREATE INDEX IF NOT EXISTS idx_employees_status_active 
ON employees(status) WHERE status = 'active';

-- Create index for manager role queries
CREATE INDEX IF NOT EXISTS idx_employees_role_managers 
ON employees(role) WHERE role IN ('daglig_leder', 'kontrollor');