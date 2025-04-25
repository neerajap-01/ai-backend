import express from 'express';
import embeddingsRoutes from './embeddings.routes.js';
import vectoresRoutes from './vectores.routes.js';
import chatRoutes from './chat.routes.js';
import authRoutes from './auth.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/embeddings', embeddingsRoutes);
router.use('/vectors', vectoresRoutes);
router.use('/chat', chatRoutes);

export default router;