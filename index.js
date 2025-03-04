import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import rootRouter from './routes/root.js';

config();

const app = express();
const PORT = process.env.NODE_PORT ?? 3000;

app.use(cors()) 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', rootRouter);

app.get('/health', (req, res) => {
  res.status(200).send({
    statusCode: 200,
    error: 0,
    message: "I'm alive! ;)",
    data: null
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} 🚀`);
});

