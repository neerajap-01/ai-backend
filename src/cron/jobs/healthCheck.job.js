import { healthCheckers, notifyHealthStatus } from "../../utils/healthCheckers.utils.js";

const healthCheckJob = async () => {
  try {
    // Check server and all registered services
    const [serverHealth, ...dbResults] = await Promise.all([
      healthCheckers.find(checker => checker.name === 'Server Health').check(),
      ...healthCheckers.filter(checker => checker.name !== 'Server Health').map(checker => checker.check())
    ]);

    const healthStatus = {
      timestamp: new Date(),
      server: serverHealth,
      services: dbResults
    };

    console.log('Health Check Status:', JSON.stringify(healthStatus, null, 2));

    // Check for any issues
    const hasIssues = [serverHealth, ...dbResults]
      .some(result => result.status === 'DOWN');

    if (hasIssues) {
      console.error('Service degradation detected!');
      // Implemented notification system
      const previousState = healthCheckJob.lastState;
      healthCheckJob.lastState = hasIssues;

      // Send notification only on state change or if it's the first check
      if (previousState === undefined || previousState !== hasIssues) {
        await notifyHealthStatus(healthStatus, hasIssues);
      }
    }

    return healthStatus;

  } catch (error) {
    console.error('Health check job failed:', error.message);
    const errorStatus = {
      timestamp: new Date(),
      server: { status: 'DOWN', message: error.message },
      services: []
    };

    // Notify on errors
    await notifyHealthStatus(errorStatus, true);
    return errorStatus;
  }
};

export default healthCheckJob;