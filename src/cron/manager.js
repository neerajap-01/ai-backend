import cron from 'node-cron';
import cronConfig from './config.js';
import cleanupJob from './jobs/cleanup.job.js';
import healthCheckJob from './jobs/healthCheck.job.js';

class CronManager {
  #tasks = new Map();

  constructor() {
    this.initializeTasks();
  }

  initializeTasks() {
    // Health check job
    this.#tasks.set('healthCheck', {
      schedule: cronConfig.everyFifteenMinutes,
      job: healthCheckJob,
      active: false
    });

    // Cleanup job
    this.#tasks.set('cleanup', {
      schedule: cronConfig.everyDayAt3am,
      job: cleanupJob,
      active: false
    });

    // Add more tasks here
  }

  startAll() {
    for (const [name, task] of this.#tasks) {
      this.startTask(name);
    }
  }

  startTask(taskName) {
    const task = this.#tasks.get(taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not found`);
    }

    if (!task.active) {
      task.instance = cron.schedule(task.schedule, task.job, {
        scheduled: true,
        timezone: "Asia/Kolkata"
      });
      task.active = true;
      console.log(`Started cron task: ${taskName}`);
    }
  }

  stopTask(taskName) {
    const task = this.#tasks.get(taskName);
    if (task && task.active) {
      task.instance.stop();
      task.active = false;
      console.log(`Stopped cron task: ${taskName}`);
    }
  }

  stopAll() {
    for (const [name] of this.#tasks) {
      this.stopTask(name);
    }
  }
}

export default new CronManager();