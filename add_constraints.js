import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xpmevfcmysfbzypluttx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbWV2ZmNteXNmYnp5cGx1dHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDIxODQsImV4cCI6MjA3NjkxODE4NH0.3CnWy8cCDYwOASQSO8BQrZzuLK9RdJUxeK2yRL3JsF8'
);

async function addConstraints() {
  console.log('Adding unique constraints to prevent duplicates...\n');
  
  // Temperature logs: One entry per item per day
  console.log('1. Temperature logs constraint...');
  const { error: tempError } = await supabase.rpc('exec_sql', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'temperature_logs_item_date_unique'
        ) THEN
          ALTER TABLE temperature_logs 
          ADD CONSTRAINT temperature_logs_item_date_unique 
          UNIQUE (item_id, recorded_date);
        END IF;
      END $$;
    `
  });
  if (tempError) console.log('Error:', tempError);
  else console.log('✓ Done');
  
  // Cleaning logs: One entry per task per day
  console.log('2. Cleaning logs constraint...');
  const { error: cleanError } = await supabase.rpc('exec_sql', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'cleaning_logs_task_date_unique'
        ) THEN
          ALTER TABLE cleaning_logs 
          ADD CONSTRAINT cleaning_logs_task_date_unique 
          UNIQUE (task_id, log_date);
        END IF;
      END $$;
    `
  });
  if (cleanError) console.log('Error:', cleanError);
  else console.log('✓ Done');
  
  // Hygiene checks: One check per person per day
  console.log('3. Hygiene checks constraint...');
  const { error: hygieneError } = await supabase.rpc('exec_sql', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'hygiene_checks_person_date_unique'
        ) THEN
          ALTER TABLE hygiene_checks 
          ADD CONSTRAINT hygiene_checks_person_date_unique 
          UNIQUE (checked_by, check_date);
        END IF;
      END $$;
    `
  });
  if (hygieneError) console.log('Error:', hygieneError);
  else console.log('✓ Done');
  
  // Cooling logs: One entry per product per day
  console.log('4. Cooling logs constraint...');
  const { error: coolingError } = await supabase.rpc('exec_sql', {
    sql: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'cooling_logs_product_date_unique'
        ) THEN
          ALTER TABLE cooling_logs 
          ADD CONSTRAINT cooling_logs_product_date_unique 
          UNIQUE (product_name, log_date);
        END IF;
      END $$;
    `
  });
  if (coolingError) console.log('Error:', coolingError);
  else console.log('✓ Done');
  
  console.log('\nAll constraints added successfully!');
}

addConstraints();
