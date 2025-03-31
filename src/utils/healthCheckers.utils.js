import { env } from '../config/keys.js';
import { getPineconeClient } from '../config/pineconeClient.js';
import axios from 'axios';
import mongoDbClient from '../config/mongoDbClient.js';
import { sendEmailWithHtml } from '../services/email.service.js';

const createHealthChecker = (name, checkFn) => ({
  name,
  check: async () => {
    try {
      const result = await checkFn();
      return {
        name,
        status: result ? 'UP' : 'DOWN',
        message: result ? 'Connected' : 'Disconnected'
      };
    } catch (error) {
      return {
        name,
        status: 'DOWN',
        message: error.message
      };
    }
  }
});

// Define health checkers
export const healthCheckers = [
  createHealthChecker('PineconeDB', async () => {
    try {
      const pineconeClient = await getPineconeClient();
      return pineconeClient ? true : false;
    } catch (error) {
      console.error('Pinecone DB health check failed', error);
      return false;
    }
  }),
  createHealthChecker('Server Health', async () => {
    try {
      const response = await axios.get(`http://localhost:${env.PORT}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Server health check failed', error);
      return false;
    }
  }),
  createHealthChecker('MongoDB', async () => {
    try {
      const client = await mongoDbClient;
      const result = await client.connection;
      return result._readyState === 1; // MongoDB returns {_readyState: 1 } on successful ping
    } catch (error) {
      console.error('MongoDB health check failed', error);
      return false;
    }
  })
];

// Helper to add new checkers
export const addHealthChecker = (name, checkFn) => {
  healthCheckers.push(createHealthChecker(name, checkFn));
};

// Helper to generate HTML for health status
const generateHealthStatusHtml = (healthStatus) => {
  const statusColor = (status) => status === 'UP' ? 'green' : 'red';
  
  return `
    <h2>Service Health Alert</h2>
    <p>Timestamp: ${healthStatus.timestamp}</p>
    
    <h3>Server Status</h3>
    <p style="color: ${statusColor(healthStatus.server.status)}">
      ${healthStatus.server.name}: ${healthStatus.server.status}
      ${healthStatus.server.message ? `(${healthStatus.server.message})` : ''}
    </p>

    <h3>Services Status</h3>
    <ul>
      ${healthStatus.services.map(service => `
        <li style="color: ${statusColor(service.status)}">
          ${service.name}: ${service.status}
          ${service.message ? `(${service.message})` : ''}
        </li>
      `).join('')}
    </ul>
  `;
};

const checkForEmailSender = (sender) => {
  try {
    //Check if the sender is comma separated emails or stringified array of emails
    if (sender.includes(',')) {
      const senders = sender.split(',').map(email => email.trim());
      return {
        flag: true,
        data: senders
      }
    } else if (sender.startsWith('[') && sender.endsWith(']')) {
      const senders = JSON.parse(sender);
      return {
        flag: true,
        data: senders
      }
    } else {
      return {
        flag: false,
        data: sender
      }
    }
  } catch (error) {
    console.error('Error checking email sender:', error);
    return {
      flag: false,
      data: 'alerts@neerajpal.dev'
    }
  }
}

export const notifyHealthStatus = async (healthStatus, hasIssues) => {
  const subject = hasIssues 
    ? '🔴 Service Degradation Detected' 
    : '🟢 Services Recovered';

  const senders = checkForEmailSender(env.ALERT_EMAIL_SENDER);

  try {
    const html = generateHealthStatusHtml(healthStatus);
    if (!senders.flag) {
      await sendEmailWithHtml(
        senders.data,
        subject,
        html
      )
      return;
    }
    
    await sendEmailWithHtml(
      senders.data,
      subject,
      html
    );
  } catch (error) {
    console.error('Error sending health status notification:', error);
  }
};