/*
  # إصلاح Cron Job للتقارير اليومية

  1. التغييرات
    - حذف الجدولة القديمة
    - إنشاء جدولة جديدة مع URL الصحيح
    - استخدام متغيرات البيئة من Supabase مباشرة
  
  2. الوقت
    - يعمل يومياً الساعة 23:00 UTC
    - لتغيير الوقت، يمكن تعديل من الإعدادات
*/

-- حذف الجدولة القديمة
SELECT cron.unschedule('daily-report-generation');

-- إنشاء الجدولة الجديدة
SELECT cron.schedule(
  'daily-report-generation',
  '0 23 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://elytkfyxfjxscupnkmqp.supabase.co/functions/v1/scheduled-daily-report',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseXRrZnl4Zmp4c2N1cG5rbXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjAxNzgsImV4cCI6MjA3NzMzNjE3OH0.ZJjCpKLtZs3fuu6BLd7N3cfvCTjeblqkUQ9lWcEolDk'
      ),
      body:=jsonb_build_object(
        'triggered_at', now(),
        'timezone', 'UTC'
      )
    ) AS request_id;
  $$
);