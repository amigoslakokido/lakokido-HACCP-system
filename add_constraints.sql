-- Temperature logs: One entry per item per day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'temperature_logs_item_date_unique'
  ) THEN
    -- First, remove duplicates by keeping only the most recent entry per item per day
    DELETE FROM temperature_logs
    WHERE id NOT IN (
      SELECT DISTINCT ON (item_id, recorded_date) id
      FROM temperature_logs
      ORDER BY item_id, recorded_date, created_at DESC
    );

    -- Then add the constraint
    ALTER TABLE temperature_logs
    ADD CONSTRAINT temperature_logs_item_date_unique
    UNIQUE (item_id, recorded_date);
  END IF;
END $$;

-- Cleaning logs: One entry per task per day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cleaning_logs_task_date_unique'
  ) THEN
    -- First, remove duplicates by keeping only the most recent entry per task per day
    DELETE FROM cleaning_logs
    WHERE id NOT IN (
      SELECT DISTINCT ON (task_id, log_date) id
      FROM cleaning_logs
      ORDER BY task_id, log_date, completed_at DESC NULLS LAST
    );

    -- Then add the constraint
    ALTER TABLE cleaning_logs
    ADD CONSTRAINT cleaning_logs_task_date_unique
    UNIQUE (task_id, log_date);
  END IF;
END $$;

-- Hygiene checks: One check per person per day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'hygiene_checks_person_date_unique'
  ) THEN
    -- First, remove duplicates by keeping only the most recent check per person per day
    DELETE FROM hygiene_checks
    WHERE id NOT IN (
      SELECT DISTINCT ON (checked_by, check_date) id
      FROM hygiene_checks
      ORDER BY checked_by, check_date, created_at DESC
    );

    -- Then add the constraint
    ALTER TABLE hygiene_checks
    ADD CONSTRAINT hygiene_checks_person_date_unique
    UNIQUE (checked_by, check_date);
  END IF;
END $$;

-- Cooling logs: One entry per product per day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'cooling_logs_product_date_unique'
  ) THEN
    -- First, remove duplicates by keeping only the most recent entry per product per day
    DELETE FROM cooling_logs
    WHERE id NOT IN (
      SELECT DISTINCT ON (product_name, log_date) id
      FROM cooling_logs
      ORDER BY product_name, log_date, created_at DESC
    );

    -- Then add the constraint
    ALTER TABLE cooling_logs
    ADD CONSTRAINT cooling_logs_product_date_unique
    UNIQUE (product_name, log_date);
  END IF;
END $$;
