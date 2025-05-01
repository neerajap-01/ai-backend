import express from 'express';
import { refreshToken, validateToken } from '../controllers/ainmail.auth.controller.js';
import checkAinmailAuth from '../middlewares/ainmailAuth.middleware.js';

const router = express.Router();

router.post('/google/validate-token', validateToken);
router.post('/google/refresh-token', checkAinmailAuth({ allowRefresh: true }), refreshToken);

export default router;