import { env } from '../config/keys.js';
import { getPineconeClient } from '../config/pineconeClient.js';
import axios from 'axios';
import mongoDbClient from '../config/mongoDbClient.js';

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
      return result._readyState === 1; // MongoDB returns { _readyState: 1 } on successful ping
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