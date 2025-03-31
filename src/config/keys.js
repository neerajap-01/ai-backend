import { config } from 'dotenv';

config();

const projectEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  UPLOAD_FILESIZE_LIMIT: process.env.UPLOAD_FILESIZE_LIMIT,
  CHUNK_BATCH_SIZE: process.env.CHUNK_BATCH_SIZE,
  WHITELISTED_DOMAINS: process.env.WHITELISTED_DOMAINS,
  MONGO_DB_URI: process.env.MONGO_DB_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  ALERT_EMAIL_SENDER: process.env.ALERT_EMAIL_SENDER,
}

export const env = projectEnv;