import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/keys.js";

export const streamingModel = new ChatOpenAI({
  model: env.OPENAI_MODEL,
  streaming: true,
  verbose: true,
  temperature: 0.7,
})

export const nonStreamingModel = new ChatOpenAI({
  model: env.OPENAI_MODEL,
  verbose: true,
  temperature: 0.7,
})