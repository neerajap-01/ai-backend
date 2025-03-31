import express from "express";
import { getAllIndexes, getAllNamespaces } from "../controllers/vectors.controller.js";

const router = express.Router();

router.get("/indexes", getAllIndexes);
router.get("/namespaces/:index", getAllNamespaces);

export default router;