import mongoose from "mongoose";
import { env } from "./keys.js";

const MONGO_DB_URI = env.MONGO_DB_URI;

const mongoDbClient = mongoose.connect(MONGO_DB_URI);

export default mongoDbClient;