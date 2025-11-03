/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for all foreign key columns that are missing them
    - This will significantly improve query performance for JOINs and foreign key lookups

  2. New Indexes
    - `idx_cleaning_logs_completed_by` on cleaning_logs(completed_by)
    - `idx_cleaning_logs_task_id` on cleaning_logs(task_id)
    - `idx_cleaning_tasks_zone_id` on cleaning_tasks(zone_id)
    - `idx_routine_task_logs_completed_by` on routine_task_logs(completed_by)
    - `idx_temperature_logs_recorded_by` on temperature_logs(recorded_by)

  3. Notes
    - These indexes will improve JOIN performance
    - Will speed up foreign key constraint checks
    - Essential for production performance
*/

-- Add index for cleaning_logs.completed_by foreign key
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_completed_by 
ON cleaning_logs(completed_by);

-- Add index for cleaning_logs.task_id foreign key
CREATE INDEX IF NOT EXISTS idx_cleaning_logs_task_id 
ON cleaning_logs(task_id);

-- Add index for cleaning_tasks.zone_id foreign key
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_zone_id 
ON cleaning_tasks(zone_id);

-- Add index for routine_task_logs.completed_by foreign key
CREATE INDEX IF NOT EXISTS idx_routine_task_logs_completed_by 
ON routine_task_logs(completed_by);

-- Add index for temperature_logs.recorded_by foreign key
CREATE INDEX IF NOT EXISTS idx_temperature_logs_recorded_by 
ON temperature_logs(recorded_by);