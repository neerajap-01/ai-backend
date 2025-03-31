import express from 'express';
import cors from 'cors';
import rootRouter from './src/routes/root.routes.js';
import { env } from './src/config/keys.js';
import cronManager from './src/cron/manager.js';
import mongoDbClient from './src/config/mongoDbClient.js';

const app = express();
const PORT = env.PORT ?? 3000;
const WHITELISTED_DOMAINS = env.WHITELISTED_DOMAINS?.split(',') ?? [];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || WHITELISTED_DOMAINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions)) 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoDbClient
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

app.use('/api', rootRouter);

app.get('/health', (req, res) => {
  res.status(200).send({
    statusCode: 200,
    error: 0,
    message: "I'm alive! ;)",
    data: null
  })
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} 🚀`);

  // Start all cron jobs
  cronManager.startAll();
});

const shutdown = async (signal) => {
  try {
    console.log(`${signal} received. Starting graceful shutdown...`);
    
    // Stop all cron jobs
    await cronManager.stopAll();
    
    // Close server (stop accepting new requests)
    server.close(() => {
      console.log('HTTP server closed');
    });
    
    // Close database connections
    await mongoDbClient.disconnect();
    
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
// Handle different termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
//   shutdown('uncaughtException');
// });
