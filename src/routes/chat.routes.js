import express from "express";
import { docsmindChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/docsmind", docsmindChat);

export default router;