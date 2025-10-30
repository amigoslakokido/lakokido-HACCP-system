/*
  # إعداد Cron Job للتقارير اليومية

  1. التحضيرات
    - تفعيل امتداد pg_cron
    - تفعيل امتداد pg_net للطلبات HTTP
  
  2. جدولة المهمة
    - إنشاء cron job يعمل يومياً عند الساعة 23:00
    - استدعاء Edge Function للتقارير المجدولة
    - استخدام مفاتيح Supabase من قاعدة البيانات
  
  3. الملاحظات
    - الوقت بتوقيت UTC (قد تحتاج لضبطه حسب منطقتك الزمنية)
    - الوظيفة تتحقق تلقائياً إذا كان هناك تقرير موجود
    - يمكن تفعيل/إيقاف الجدولة من الإعدادات
*/

-- تفعيل امتدادات ضرورية
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- حذف الجدولة القديمة إذا كانت موجودة
SELECT cron.unschedule('daily-report-generation') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-report-generation'
);

-- إنشاء جدولة جديدة للتقرير اليومي عند الساعة 23:00 UTC
SELECT cron.schedule(
  'daily-report-generation',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url:=current_setting('app.settings.api_url', true) || '/functions/v1/scheduled-daily-report',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key', true)
    ),
    body:=jsonb_build_object(
      'triggered_at', now()
    )
  );
  $$
);