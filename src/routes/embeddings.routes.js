import express from 'express';
import { createEmbedding } from '../controllers/openai.controller.js';
import uploads from '../utils/upload.util.js'

const router = express.Router();

router.post('/openai', uploads.single('doc'), createEmbedding);

export default router;