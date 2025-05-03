import express from 'express';
import ainmailAuth from './ainmail.auth.routes.js';
import mailRoutes from './mail.routes.js';

const router = express.Router();

router.use('/auth', ainmailAuth);
router.use('/mail', mailRoutes);

export default router;