/*
  # Add Task Scheduling to Routine Tasks

  ## Purpose
  Allow routine tasks to be scheduled based on different frequencies:
  - daily: Every day (default)
  - weekly: Specific days of week (Monday, Tuesday, etc.)
  - monthly: Specific days of month (1-31)
  - time_based: Specific times during the day

  ## Changes
  1. Add scheduling columns to routine_tasks table:
     - `schedule_type` (text) - Type of schedule: daily, weekly, monthly, time_based
     - `schedule_config` (jsonb) - Configuration for the schedule
       - For weekly: {"days": [0,1,2,3,4,5,6]} (0=Sunday, 6=Saturday)
       - For monthly: {"days": [1,15,30]} (days of month)
       - For time_based: {"times": ["09:00", "14:00", "18:00"]}

  ## Security
  - No new RLS policies needed (uses existing table policies)

  ## Notes
  - Default is 'daily' with empty config
  - Config is flexible JSON to allow future expansions
  - Norwegian week starts on Monday, but ISO uses Sunday=0
*/

-- Add scheduling columns to routine_tasks
ALTER TABLE routine_tasks
ADD COLUMN IF NOT EXISTS schedule_type text DEFAULT 'daily' CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'time_based')),
ADD COLUMN IF NOT EXISTS schedule_config jsonb DEFAULT '{}'::jsonb;

-- Add index for faster filtering by schedule_type
CREATE INDEX IF NOT EXISTS idx_routine_tasks_schedule_type
  ON routine_tasks(schedule_type);

-- Add comment to explain the schema
COMMENT ON COLUMN routine_tasks.schedule_type IS 'Type of schedule: daily, weekly, monthly, time_based';
COMMENT ON COLUMN routine_tasks.schedule_config IS 'JSON config: weekly={days:[0-6]}, monthly={days:[1-31]}, time_based={times:["HH:MM"]}';
