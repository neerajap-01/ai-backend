import express from 'express';
import ainmailAuth from './ainmail.auth.routes.js';
import gmailRoutes from './gmail.routes.js';

const router = express.Router();

router.use('/auth', ainmailAuth);
router.use('/gmail', gmailRoutes);

export default router;