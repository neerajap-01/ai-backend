import express from 'express';
import cors from 'cors';
import rootRouter from './src/routes/root.routes.js';
import { env } from './src/config/keys.js';

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

app.use('/api', rootRouter);

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

