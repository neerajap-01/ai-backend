import express from "express";
import { generateMail, getEmailDetails, messages, sendEmail } from "../controllers/mail.controller.js";
import checkAinmailAuth from "../middlewares/ainmailAuth.middleware.js";

const router = express.Router();

router.post('/messages', checkAinmailAuth(),  messages);
router.post('/generate', checkAinmailAuth(), generateMail);
router.post('/send', checkAinmailAuth(), sendEmail);
router.get('/message/:messageId', checkAinmailAuth(), getEmailDetails);

export default router;