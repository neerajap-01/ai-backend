import express from 'express';
import { createSingleFileEmbedding, createMultipleFileEmbedding } from '../controllers/openai.controller.js';
import uploads from '../utils/upload.util.js'

const router = express.Router();

router.post('/single/openai', uploads.single('doc'), createSingleFileEmbedding);
router.post('/multiple/openai', uploads.any('docs'), createMultipleFileEmbedding);

export default router;