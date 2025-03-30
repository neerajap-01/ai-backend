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
}

export const env = projectEnv;