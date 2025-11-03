/*
  # Add Remaining Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for remaining foreign key columns
    - Improves query performance for JOINs and lookups

  2. New Indexes
    - `idx_daily_routine_logs_employee_id` on daily_routine_logs(employee_id)
    - `idx_daily_routine_logs_task_id` on daily_routine_logs(task_id)
    - `idx_incident_attachments_incident_id` on incident_attachments(incident_id)
    - `idx_routine_task_logs_task_id` on routine_task_logs(task_id)

  3. Notes
    - These indexes are essential for production performance
    - Will speed up all queries that join these tables
    - Minimal storage overhead compared to performance gain
*/

-- Add index for daily_routine_logs.employee_id foreign key
CREATE INDEX IF NOT EXISTS idx_daily_routine_logs_employee_id 
ON daily_routine_logs(employee_id);

-- Add index for daily_routine_logs.task_id foreign key
CREATE INDEX IF NOT EXISTS idx_daily_routine_logs_task_id 
ON daily_routine_logs(task_id);

-- Add index for incident_attachments.incident_id foreign key
CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident_id 
ON incident_attachments(incident_id);

-- Add index for routine_task_logs.task_id foreign key
CREATE INDEX IF NOT EXISTS idx_routine_task_logs_task_id 
ON routine_task_logs(task_id);