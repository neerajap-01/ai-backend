import express from 'express';
import embeddingsRoutes from './embeddings.routes.js';

const router = express.Router();

router.use('/embeddings', embeddingsRoutes);

export default router;