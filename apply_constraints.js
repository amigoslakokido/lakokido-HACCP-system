import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://xpmevfcmysfbzypluttx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbWV2ZmNteXNmYnp5cGx1dHR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM0MjE4NCwiZXhwIjoyMDc2OTE4MTg0fQ.Uaj4M3jHbfp3XU8U1kqmj8CgJaZnfHCXJNtOqVR2yF4'
);

const sql = readFileSync('add_constraints.sql', 'utf8');

console.log('Applying constraints...\n');

// Split by DO $$ blocks and execute each
const blocks = sql.split('-- ').filter(b => b.trim());

for (const block of blocks) {
  const lines = block.trim().split('\n');
  const title = lines[0];
  const code = lines.slice(1).join('\n');
  
  console.log(`Processing: ${title}`);
  
  const { error } = await supabase.rpc('exec', { sql: code });
  
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✓ Success\n');
  }
}

console.log('Done!');
