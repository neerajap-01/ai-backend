import { healthCheckers } from "../../utils/healthCheckers.utils.js";

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
      // TODO: Implement notification system
    }

    return healthStatus;

  } catch (error) {
    console.error('Health check job failed:', error.message);
    return {
      timestamp: new Date(),
      server: { status: 'DOWN', message: error.message },
      services: []
    };
  }
};

export default healthCheckJob;