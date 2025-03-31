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
  everyMinute: validateAndParseCron('* * * * *'),
  
  // Every 5/10/15/30 minutes
  everyFiveMinutes: validateAndParseCron('*/5 * * * *'),
  everyTenMinutes: validateAndParseCron('*/10 * * * *'),
  everyFifteenMinutes: validateAndParseCron('*/15 * * * *'),
  everyThirtyMinutes: validateAndParseCron('*/30 * * * *'),
  
  // Hourly patterns
  everyHour: validateAndParseCron('0 * * * *'),
  everyTwoHours: validateAndParseCron('0 */2 * * *'),
  everySixHours: validateAndParseCron('0 */6 * * *'),
  
  // Daily patterns
  everyDay: validateAndParseCron('0 0 * * *'),             // At midnight
  everyDayAt3am: validateAndParseCron('0 3 * * *'),        // At 3 AM
  everyDayAt4am: validateAndParseCron('0 4 * * *'),        // At 4 AM
  everyDayNoon: validateAndParseCron('0 12 * * *'),        // At 12 PM
  
  // Weekly patterns
  everySunday: validateAndParseCron('0 0 * * 0'),
  everyMonday: validateAndParseCron('0 0 * * 1'),
  everyTuesday: validateAndParseCron('0 0 * * 2'),
  everyWednesday: validateAndParseCron('0 0 * * 3'),
  everyThursday: validateAndParseCron('0 0 * * 4'),
  everyFriday: validateAndParseCron('0 0 * * 5'),
  
  // Monthly patterns
  firstDayOfMonth: validateAndParseCron('0 0 1 * *'),      // At midnight on the first day of the month
  lastDayOfMonth: validateAndParseCron('59 23 28-31 * *'), // At 11:59 PM on the last day of the month
  
  // Common maintenance windows
  weekendMaintenance: validateAndParseCron('0 0 * * 6,0'),  // Midnight on Saturday and Sunday
  offHours: validateAndParseCron('0 0 1-5 * *'),           // 12 AM on weekdays
  businessHours: validateAndParseCron('0 9-17 * * 1-5'),   // Every hour 9 AM-5 PM on weekdays
  
  // Backup schedules
  dailyBackup: validateAndParseCron('0 2 * * *'),          // 2 AM daily
  weeklyBackup: validateAndParseCron('0 0 * * 0'),         // Midnight on Sunday
  monthlyBackup: validateAndParseCron('0 0 1 * *'),        // Midnight on first day of month
  
  // Health checks
  healthCheck: validateAndParseCron('*/5 * * * *'),        // Every 5 minutes
  databaseCleanup: validateAndParseCron('0 3 * * *'),      // 3 AM daily
  logRotation: validateAndParseCron('0 0 * * 0'),          // Weekly log rotation
};

export default cronConfig;