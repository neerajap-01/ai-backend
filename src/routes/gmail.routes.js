import express from "express";
import { messages, sendEmail } from "../controllers/gmail.controller.js";
import checkAinmailAuth from "../middlewares/ainmailAuth.middleware.js";

const router = express.Router();

router.post('/messages', checkAinmailAuth,  messages);
router.post('/send', checkAinmailAuth, sendEmail);

export default router;