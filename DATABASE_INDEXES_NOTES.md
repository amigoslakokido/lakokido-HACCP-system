# Database Indexes Documentation

## About "Unused" Indexes Warning

Supabase may report certain indexes as "unused" when they haven't been utilized in recent query executions. However, **these indexes are critical for production performance** and should NOT be removed.

### Why These Indexes Are Essential

#### Foreign Key Indexes
The following indexes cover foreign key columns and are essential for:
- JOIN operations performance
- Foreign key constraint checks
- Referential integrity maintenance
- Query optimization

**Keep these indexes:**
- `idx_cleaning_tasks_zone_id` - Used when joining cleaning_tasks with zones
- `idx_cleaning_logs_completed_by` - Used when joining cleaning_logs with employees
- `idx_cleaning_logs_task_id` - Used when joining cleaning_logs with cleaning_tasks
- `idx_temperature_logs_recorded_by` - Used when joining temperature_logs with employees
- `idx_routine_task_logs_completed_by` - Used when joining routine_task_logs with employees
- `idx_routine_task_logs_task_id` - Used when joining routine_task_logs with routine_tasks
- `idx_daily_routine_logs_employee_id` - Used when joining daily_routine_logs with employees
- `idx_daily_routine_logs_task_id` - Used when joining daily_routine_logs with daily_routine_templates
- `idx_incident_attachments_incident_id` - Used when joining incident_attachments with critical_incidents

### When Indexes Show as "Unused"

An index may show as "unused" if:
1. The database is new and hasn't had many queries yet
2. The statistics collection period hasn't captured usage
3. Queries haven't yet required that specific access pattern
4. The application is in development/testing phase

### Performance Impact Without These Indexes

Removing foreign key indexes would cause:
- **Slow JOINs**: Every join operation would require full table scans
- **Slow DELETE operations**: Checking foreign key constraints becomes expensive
- **Slow UPDATE operations**: Updating foreign key columns becomes expensive
- **Poor scalability**: Performance degrades significantly as data grows

## Extension in Public Schema

### pg_net Extension

The `pg_net` extension is installed in the `public` schema. This is **normal and expected in Supabase**:

- Supabase manages this extension automatically
- It's required for Supabase Edge Functions and webhooks
- Moving it requires superuser privileges (not available to database users)
- This configuration is secure in Supabase's managed environment
- **No action required**

## Recommendations

1. **Keep all foreign key indexes** - They're essential for production performance
2. **Monitor actual query performance** - Use EXPLAIN ANALYZE to verify index usage
3. **Don't remove indexes based solely on "unused" warnings** - Consider the access patterns
4. **Regular maintenance** - Run ANALYZE periodically to update statistics
5. **Performance testing** - Test with production-like data volumes before removing any index

## Summary

✅ All critical foreign key indexes are in place
✅ Unused index warnings can be safely ignored for foreign key indexes
✅ pg_net extension configuration is correct for Supabase
✅ Database is optimized for production use
