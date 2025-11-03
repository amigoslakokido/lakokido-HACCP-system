import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xpmevfcmysfbzypluttx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwbWV2ZmNteXNmYnp5cGx1dHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDIxODQsImV4cCI6MjA3NjkxODE4NH0.3CnWy8cCDYwOASQSO8BQrZzuLK9RdJUxeK2yRL3JsF8'
);

async function checkData() {
  const today = new Date().toISOString().split('T')[0];
  
  console.log('=== Temperature Logs for today ===');
  const { data: tempLogs } = await supabase
    .from('temperature_logs')
    .select('*')
    .eq('recorded_date', today);
  console.log('Count:', tempLogs?.length);
  if (tempLogs && tempLogs.length > 0) {
    console.log('Sample:', tempLogs.slice(0, 3));
  }
  
  console.log('\n=== Cleaning Logs for today ===');
  const { data: cleanLogs } = await supabase
    .from('cleaning_logs')
    .select('*')
    .eq('log_date', today);
  console.log('Count:', cleanLogs?.length);
  if (cleanLogs && cleanLogs.length > 0) {
    console.log('Sample:', cleanLogs.slice(0, 3));
  }
  
  console.log('\n=== Hygiene Checks for today ===');
  const { data: hygieneChecks } = await supabase
    .from('hygiene_checks')
    .select('*')
    .eq('check_date', today);
  console.log('Count:', hygieneChecks?.length);
  if (hygieneChecks && hygieneChecks.length > 0) {
    console.log('Sample:', hygieneChecks.slice(0, 3));
  }
  
  console.log('\n=== Cooling Logs for today ===');
  const { data: coolingLogs } = await supabase
    .from('cooling_logs')
    .select('*')
    .eq('log_date', today);
  console.log('Count:', coolingLogs?.length);
  if (coolingLogs && coolingLogs.length > 0) {
    console.log('Sample:', coolingLogs.slice(0, 3));
  }
}

checkData();
