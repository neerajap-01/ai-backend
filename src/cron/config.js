import cron from 'node-cron';

const validateAndParseCron = (expression) => {
  if (!cron.validate(expression)) {
    throw new Error(`Invalid cron expression: ${expression}`);
  }
  return expression;
};
/**
 * 💡 Tips for Choosing Cron Timing:
  Health Checks: Every 5-15 minutes
  Backups: During off-hours (usually 2-4 AM)
  Log Rotation: Daily or weekly during low-traffic periods
  Data Cleanup: Early morning hours (2-5 AM)
  Reports Generation: After business hours
  Cache Updates: Based on data volatility (hourly/daily)
 */
const cronConfig = {
  // Every minute
  everyMinute: '* * * * *',
  
  // Every 5/10/15/30 minutes
  everyFiveMinutes: '*/5 * * * *',
  everyTenMinutes: '*/10 * * * *',
  everyFifteenMinutes: '*/15 * * * *',
  everyThirtyMinutes: '*/30 * * * *',
  
  // Hourly patterns
  everyHour: '0 * * * *',
  everyTwoHours: '0 */2 * * *',
  everySixHours: '0 */6 * * *',
  
  // Daily patterns
  everyDay: '0 0 * * *',             // At midnight
  everyDayAt3am: '0 3 * * *',        // At 3 AM
  everyDayAt4am: '0 4 * * *',        // At 4 AM
  everyDayNoon: '0 12 * * *',        // At 12 PM
  
  // Weekly patterns
  everySunday: '0 0 * * 0',
  everyMonday: '0 0 * * 1',
  
  // Monthly patterns
  firstDayOfMonth: '0 0 1 * *',
  lastDayOfMonth: '59 23 28-31 * *',
  
  // Common maintenance windows
  weekendMaintenance: '0 0 * * 6,0',  // Midnight on Saturday and Sunday
  offHours: '0 0 1-5 * *',           // 12 AM on weekdays
  businessHours: '0 9-17 * * 1-5',   // Every hour 9 AM-5 PM on weekdays
  
  // Backup schedules
  dailyBackup: '0 2 * * *',          // 2 AM daily
  weeklyBackup: '0 0 * * 0',         // Midnight on Sunday
  monthlyBackup: '0 0 1 * *',        // Midnight on first day of month
  
  // Health checks
  healthCheck: '*/5 * * * *',        // Every 5 minutes
  databaseCleanup: '0 3 * * *',      // 3 AM daily
  logRotation: '0 0 * * 0',          // Weekly log rotation
};

export default cronConfig;