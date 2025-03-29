import express, { Router } from 'express';
import cors from 'cors';
import rootRouter from '../../src/routes/root.routes.js';
import { env } from '../../src/config/keys.js';
import serverless from 'serverless-http';

const router = Router();

const app = express();

router.use(cors()) 
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

app.use('/api/', rootRouter);

router.get('/health', (req, res) => {
  res.status(200).send({
    statusCode: 200,
    error: 0,
    message: "I'm alive! ;)",
    data: null
  })
})

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT} 🚀`);
// });

export const handler = serverless(app);