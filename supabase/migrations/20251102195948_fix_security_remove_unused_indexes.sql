/*
  # Remove Unused Indexes

  1. Performance Improvements
    - Remove indexes that are not being used
    - Reduces storage overhead
    - Improves INSERT/UPDATE performance

  2. Indexes to Remove
    - `idx_equipment_active` - unused
    - `idx_employees_active` - unused
    - `idx_employees_role_managers` - unused
    - `idx_employees_role` - unused
    - `idx_employees_status_active` - unused
    - `idx_critical_incidents_status` - unused
    - `idx_incident_attachments_incident_id` - unused
    - `idx_dishwasher_logs_date` - unused
    - `idx_routine_task_logs_task` - unused
    - `idx_daily_routine_templates_active` - unused
    - `idx_daily_routine_logs_task` - unused
    - `idx_daily_routine_logs_employee` - unused

  3. Notes
    - These indexes consume storage and slow down writes
    - Can be recreated later if needed
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_equipment_active;
DROP INDEX IF EXISTS idx_employees_active;
DROP INDEX IF EXISTS idx_employees_role_managers;
DROP INDEX IF EXISTS idx_employees_role;
DROP INDEX IF EXISTS idx_employees_status_active;
DROP INDEX IF EXISTS idx_critical_incidents_status;
DROP INDEX IF EXISTS idx_incident_attachments_incident_id;
DROP INDEX IF EXISTS idx_dishwasher_logs_date;
DROP INDEX IF EXISTS idx_routine_task_logs_task;
DROP INDEX IF EXISTS idx_daily_routine_templates_active;
DROP INDEX IF EXISTS idx_daily_routine_logs_task;
DROP INDEX IF EXISTS idx_daily_routine_logs_employee;