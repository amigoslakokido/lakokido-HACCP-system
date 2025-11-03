/*
  # Fix Security Issues - Remove Unused Indexes

  ## Changes
  This migration removes all unused indexes that are not being utilized by queries,
  which helps reduce storage overhead and improve write performance.

  ## Indexes Being Removed
  1. `idx_cleaning_tasks_zone_id` - Not used for queries
  2. `idx_cleaning_logs_completed_by` - Not used for queries
  3. `idx_cleaning_logs_task_id` - Not used for queries
  4. `idx_incident_attachments_incident_id` - Not used for queries
  5. `idx_routine_task_logs_completed_by` - Not used for queries
  6. `idx_routine_task_logs_task_id` - Not used for queries
  7. `idx_daily_routine_logs_employee_id` - Not used for queries
  8. `idx_daily_routine_logs_task_id` - Not used for queries

  ## Impact
  - Reduced storage usage
  - Faster INSERT, UPDATE, DELETE operations
  - No impact on query performance (indexes were not being used)
*/

-- Drop unused indexes on cleaning_tasks
DROP INDEX IF EXISTS idx_cleaning_tasks_zone_id;

-- Drop unused indexes on cleaning_logs
DROP INDEX IF EXISTS idx_cleaning_logs_completed_by;
DROP INDEX IF EXISTS idx_cleaning_logs_task_id;

-- Drop unused indexes on incident_attachments
DROP INDEX IF EXISTS idx_incident_attachments_incident_id;

-- Drop unused indexes on routine_task_logs
DROP INDEX IF EXISTS idx_routine_task_logs_completed_by;
DROP INDEX IF EXISTS idx_routine_task_logs_task_id;

-- Drop unused indexes on daily_routine_logs
DROP INDEX IF EXISTS idx_daily_routine_logs_employee_id;
DROP INDEX IF EXISTS idx_daily_routine_logs_task_id;