import express from 'express';
import embeddingsRoutes from './embeddings.routes.js';
import vectoresRoutes from './vectores.routes.js'

const router = express.Router();

router.use('/embeddings', embeddingsRoutes);
router.use('/vectors', vectoresRoutes);

export default router;